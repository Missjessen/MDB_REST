// src/services/adDefsService.ts
import { OAuth2Client } from 'google-auth-library';
import { connect, disconnect } from '../repository/database';
import { AdDefModel } from '../models/adDefModel';
//import { parseAdsFromSheet } from './googleSheetsService';
import { google } from 'googleapis';



// src/services/googleSheets/adSheetService.ts

interface ParsedAd {
  adGroup:   string;
  headline1: string;
  headline2?:string;
  description:string;
  finalUrl:  string;
  path1?:    string;
  path2?:    string;
  rowIndex:  number;
}

export async function parseAdsFromSheet(
  oAuthClient: OAuth2Client,
  sheetId: string
): Promise<ParsedAd[]> {
  const sheets = google.sheets({ version:'v4', auth: oAuthClient });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'Annoncer!A2:F'
  });
  const rows = res.data.values || [];
  return rows
    .map((r,i) => ({
      adGroup:    r[0] as string,
      headline1:  r[1] as string,
      headline2:  r[2] as string,
      description:r[3] as string,
      finalUrl:   r[4] as string,
      path1:      r[5] as string,
      rowIndex:   i+2
    }))
    .filter(a => a.adGroup && a.headline1 && a.description);
}

export async function syncAdDefsFromSheet(
  oAuthClient: OAuth2Client,
  sheetId: string,
  userId: string
): Promise<ParsedAd[]> {
  const parsed = await parseAdsFromSheet(oAuthClient, sheetId);

  await AdDefModel.deleteMany({ sheetId, userId });
  await AdDefModel.insertMany(parsed.map(a => ({
    userId,
    sheetId,
    adGroup:     a.adGroup,
    headline1:   a.headline1,
    headline2:   a.headline2,
    description: a.description,
    finalUrl:    a.finalUrl,
    path1:       a.path1,
    path2:       a.path2,
    rowIndex:    a.rowIndex,
    createdAt:   new Date()
  })));

  return parsed;
}



/** Opdater én række i Sheet efter DB-opdatering */
export async function updateAdRowInSheet(
  oAuthClient: OAuth2Client,
  sheetId: string,
  adId: string,
  updates: Partial<{
    adGroup:string; headline1:string; headline2:string;
    description:string; finalUrl:string; path1:string; path2:string;
  }>
): Promise<void> {
  const doc = await AdDefModel.findById(adId).lean();
  if (!doc?.rowIndex) return;
  const row = doc.rowIndex;
  const sheets = google.sheets({ version:'v4', auth: oAuthClient });
  const data: { range:string; values:unknown[][] }[] = [];

  if (updates.adGroup)    data.push({ range:`Annoncer!A${row}`, values:[[updates.adGroup]] });
  if (updates.headline1)  data.push({ range:`Annoncer!B${row}`, values:[[updates.headline1]] });
  if (updates.headline2)  data.push({ range:`Annoncer!C${row}`, values:[[updates.headline2]] });
  if (updates.description)data.push({ range:`Annoncer!D${row}`, values:[[updates.description]] });
  if (updates.finalUrl)   data.push({ range:`Annoncer!E${row}`, values:[[updates.finalUrl]] });
  if (updates.path1)      data.push({ range:`Annoncer!F${row}`, values:[[updates.path1]] });
  // path2 kunne være G…

  if (data.length) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: { valueInputOption:'RAW', data }
    });
  }
}

/** Slet én række i Sheet */
export async function deleteAdRowInSheet(
    oAuthClient: OAuth2Client,
    spreadsheetId: string,
    rowIndex: number
  ): Promise<void> {
    const sheets = google.sheets({ version: 'v4', auth: oAuthClient });
  
    // Først hent sheetId for fanen “Annoncer”
    const info = await sheets.spreadsheets.get({ spreadsheetId });
    const annoncerSheetId = info.data.sheets!
      .find(s => s.properties!.title === 'Annoncer')!
      .properties!.sheetId!;
  
    // Så slet lige netop den række
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId:    annoncerSheetId,
              dimension:  'ROWS',
              startIndex: rowIndex - 1, // zero-based
              endIndex:   rowIndex
            }
          }
        }]
      }
    });
  }
