// src/services/keywordDefsService.ts
import { OAuth2Client } from 'google-auth-library';
import { connect, disconnect } from '../repository/database';
import { KeywordDefModel } from '../models/KeywordDefModel';
//import { parseKeywordsFromSheet } from './googleSheetsService';
import type { IKeywordDef } from '../interfaces/iKeywordDef';

// src/services/googleSheets/keywordSheetService.ts
import { google } from 'googleapis';


// 1) parseKeywordsFromSheet – læs Keywords!A2:D, returnér også rowIndex
export interface ParsedKeyword {
    adGroup: string;
    keyword: string;
    matchType: 'BROAD'|'PHRASE'|'EXACT';
    cpc?: number;
    rowIndex: number;
  }
  
  export async function parseKeywordsFromSheet(
    oAuthClient: OAuth2Client,
    sheetId: string
  ): Promise<ParsedKeyword[]> {
    const sheets = google.sheets({ version:'v4', auth: oAuthClient });
    const res    = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Keywords!A2:D'
    });
    const rows = res.data.values || [];
  
    return rows
      .map((r, i) => {
        // r[3] kan være '', undefined eller en tekst der ikke er et tal
        const rawCpc = r[3];
        let cpc: number | undefined;
        if (rawCpc != null && rawCpc !== '') {
          const parsed = Number(rawCpc);
          if (!Number.isNaN(parsed)) cpc = parsed;
        }
  
        return {
          adGroup:   String(r[0] ?? ''),
          keyword:   String(r[1] ?? ''),
          matchType: (String(r[2] ?? '') as 'BROAD'|'PHRASE'|'EXACT'),
          cpc,
          rowIndex:  i + 2
        };
      })
      .filter(k => k.adGroup && k.keyword);
  }

// 2) syncKeywordDefsFromSheet – slet gamle, indsæt nye inkl. rowIndex
export async function syncKeywordDefsFromSheet(
    oAuthClient: OAuth2Client,
    sheetId: string,
    userId: string
  ): Promise<ParsedKeyword[]> {
    const parsed = await parseKeywordsFromSheet(oAuthClient, sheetId);
  
    await connect();
    try {
      await KeywordDefModel.deleteMany({ sheetId, userId });
  
      const docs = parsed.map(k => {
        const doc: any = {
          userId,
          sheetId,
          adGroup: k.adGroup,
          keyword: k.keyword,
          matchType: k.matchType,
          rowIndex: k.rowIndex,
          createdAt: new Date()
        };
        // kun tilføj cpc hvis det ikke er undefined
        if (typeof k.cpc === 'number') {
          doc.cpc = k.cpc;
        }
        return doc;
      });
  
      await KeywordDefModel.insertMany(docs);
    } finally {
      await disconnect();
    }
  
    return parsed;
  }

// 3) updateKeywordRowInSheet – skriv enkelt-celle opdateringer
export async function updateKeywordRowInSheet(
  oAuthClient: OAuth2Client,
  sheetId: string,
  keywordId: string,
  updates: Partial<{ adGroup: string; keyword: string; matchType: string; cpc: number }>
) {
  // hent rowIndex fra DB
  const doc = await KeywordDefModel.findById(keywordId).lean();
  if (!doc?.rowIndex) return;
  const row = doc.rowIndex;
  const sheets = google.sheets({ version: 'v4', auth: oAuthClient });
  const data: { range: string; values: unknown[][] }[] = [];

  if (updates.adGroup)  data.push({ range: `Keywords!A${row}`, values:[[updates.adGroup]] });
  if (updates.keyword)  data.push({ range: `Keywords!B${row}`, values:[[updates.keyword]] });
  if (updates.matchType) data.push({ range: `Keywords!C${row}`, values:[[updates.matchType]] });
  if (updates.cpc != null) data.push({ range: `Keywords!D${row}`, values:[[updates.cpc]] });

  if (data.length) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: { valueInputOption: 'RAW', data }
    });
  }
}

// 4) deleteKeywordRowInSheet – slet én række med deleteDimension
export async function deleteKeywordRowInSheet(
    oAuthClient: OAuth2Client,
    sheetId: string,
    rowIndex: number
  ): Promise<void> {
    // 1) Find fanens interne sheetId
    const sheets = google.sheets({ version: 'v4', auth: oAuthClient });
    const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
    const kwSheet = meta.data.sheets?.find(s => s.properties?.title === 'Keywords');
    if (!kwSheet) return;
    const tabId = kwSheet.properties!.sheetId!;
    // 2) Delete rækken (zero-based startIndex)
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId:    tabId,
              dimension:  'ROWS',
              startIndex: rowIndex - 1,
              endIndex:   rowIndex
            }
          }
        }]
      }
    });
  }