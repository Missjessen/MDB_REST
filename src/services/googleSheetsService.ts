import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { getGoogleAccessToken } from './googleAuthService';
import { IKeywordDef } from '../interfaces/iKeywordDef';
import { IAdDef } from '../interfaces/iAdDef';
import { connect, disconnect } from '../repository/database';
import { KeywordDefModel } from '../models/KeywordDefModel';



/**
 * Opretter et Google Sheet med standardstruktur (Kampagner, Annoncer, Keywords, Forklaring)
 * @param oAuthClient - Google OAuth klient med refresh token sat
 * @param title - Titel på arket
 * @returns Sheet ID
 */

// /* /**
//  * Create a single "AllResources" sheet with header row and color.
//  */
// export async function createUserSheet(oAuthClient: OAuth2Client, title: string): Promise<string> {
//   const sheets = google.sheets({ version: 'v4', auth: oAuthClient });
//   const resp = await sheets.spreadsheets.create({
//     requestBody: {
//       properties: { title },
//       sheets: [{ properties: { title: 'AllResources', gridProperties: { frozenRowCount: 1 } } }]
//     }
//   });
//   const spreadsheetId = resp.data.spreadsheetId!;
//   const sheetId = resp.data.sheets![0].properties!.sheetId!;

//   const headers = [
//     'resourceType','id','parentId','name','budget','status',
//     'startDate','endDate','headline1','headline2',
//     'description','finalUrl','keywordText','matchType',
//     'action','syncStatus'
//   ];

//   await sheets.spreadsheets.values.update({
//     spreadsheetId,
//     range: 'AllResources!A1:P1',
//     valueInputOption: 'RAW',
//     requestBody: { values: [headers] }
//   });

//   await sheets.spreadsheets.batchUpdate({
//     spreadsheetId,
//     requestBody: { requests: [{
//       repeatCell: {
//         range: { sheetId, startRowIndex:0, endRowIndex:1 },
//         cell: { userEnteredFormat: { backgroundColor:{ red:1,green:0.95,blue:0.75 }, textFormat:{ bold:true } } },
//         fields: 'userEnteredFormat(backgroundColor,textFormat)'
//       }
//     }]} }
//   );

//     return spreadsheetId;
//   } */

export async function createUserSheet(oAuthClient: OAuth2Client, title: string): Promise<string> {
  const sheets = google.sheets({ version: 'v4', auth: oAuthClient });

  const response = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title },
      sheets: [
        { properties: { title: 'Kampagner', gridProperties: { frozenRowCount: 1 } } },
        { properties: { title: 'Annoncer', gridProperties: { frozenRowCount: 1 } } },
        { properties: { title: 'Keywords', gridProperties: { frozenRowCount: 1 } } },
        { properties: { title: 'Forklaring' } }
      ]
    }
  });

  const spreadsheetId = response.data.spreadsheetId!;
  const sheetIdMap = (response.data.sheets ?? []).reduce((acc, sheet) => {
    acc[sheet.properties!.title!] = sheet.properties!.sheetId!;
    return acc;
  }, {} as Record<string, number>);

  // Sæt headers i de 3 ark
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: 'RAW',
      data: [
        { range: 'Kampagner!A1:E1', values: [['Campaign Name','Status','Budget','Start Date','End Date']] },
        { range: 'Annoncer!A1:F1', values: [['Ad Group','Headline 1','Headline 2','Description','Final URL','Path']] },
        { range: 'Keywords!A1:D1', values: [['Ad Group','Keyword','Match Type','CPC']] },
        { range: 'Forklaring!A1',  values: [[
            'Dette ark er opdelt i 3 hovedark: Kampagner, Annoncer og Keywords.\n\n' +
            '- Udfyld en række pr. kampagne, annonce eller søgeord.\n' +
            '- Brug validerede værdier som status = Enabled/Paused, matchtype = Broad/Phrase/Exact.\n' +
            '- Dette ark er forbundet til Google Ads API og kan automatisk synkroniseres.'
        ]] }
      ]
    }
  });

  // Farv header-rækker
  const requests = ['Kampagner','Annoncer','Keywords'].map(title => ({
    repeatCell: {
      range: { sheetId: sheetIdMap[title], startRowIndex:0, endRowIndex:1 },
      cell: { userEnteredFormat: { backgroundColor:{ red:1,green:0.95,blue:0.75 }, textFormat:{ bold:true } } },
      fields: 'userEnteredFormat(backgroundColor,textFormat)'
    }
  }));
  await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody:{ requests } });

  return spreadsheetId;
}



export interface ParsedCampaign {
  name: string;
  status: 'ENABLED' | 'PAUSED';
  startDate: string;
  endDate: string;
}

export async function parseCampaignsFromSheet(oAuthClient: OAuth2Client, sheetId: string): Promise<ParsedCampaign[]> {
  const sheets = google.sheets({ version: 'v4', auth: oAuthClient });
  const range = 'Kampagner!A2:E';

  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range,
  });

  const rows = result.data.values;
  if (!rows || rows.length === 0) return [];

  const campaigns: ParsedCampaign[] = [];
  for (let i = 0; i < rows.length; i++) {
    const [name, status, , startDate, endDate] = rows[i];
    if (!name || !status || !startDate || !endDate) continue;

    campaigns.push({
      name,
      status: status.toUpperCase() === 'PAUSED' ? 'PAUSED' : 'ENABLED',
      startDate,
      endDate
    });
  }

  return campaigns;
}
// … eksisterende imports …
export async function parseAdsFromSheet(
  oAuthClient: OAuth2Client, sheetId: string
): Promise<(Omit<IAdDef,'_id'|'userId'|'sheetId'> & { rowIndex: number })[]> {
  const sheets = google.sheets({ version: 'v4', auth: oAuthClient });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId, range: 'Annoncer!A2:F'
  });
  const rows = res.data.values || [];
  return rows.map((r,i) => ({
    adGroup:   r[0], headline1: r[1], headline2: r[2],
    description: r[3], finalUrl: r[4], path1: r[5],
    rowIndex: i+2
  }));
}

// export async function parseKeywordsFromSheet(
//   oAuthClient: OAuth2Client, sheetId: string
// ): Promise<(Omit<IKeywordDef,'_id'|'userId'|'sheetId'> & { rowIndex: number })[]> {
//   const sheets = google.sheets({ version: 'v4', auth: oAuthClient });
//   const res = await sheets.spreadsheets.values.get({
//     spreadsheetId: sheetId, range: 'Keywords!A2:D'
//   });
//   const rows = res.data.values || [];
//   return rows.map((r,i) => ({
//     adGroup: r[0], keyword: r[1], matchType: r[2] as any,
//     cpc: r[3]?Number(r[3]):undefined, rowIndex: i+2
//   }));
// }

export async function writeStatusToSheet(oAuthClient: OAuth2Client, sheetId: string, statuses: string[]) {
  const sheets = google.sheets({ version: 'v4', auth: oAuthClient });

  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `Kampagner!F2:F${statuses.length + 1}`,
    valueInputOption: 'RAW',
    requestBody: {
      values: statuses.map(status => [status])
    }
  });
}

/**
 * Ændrer kun arktitlen (spreadsheet title) i Google Sheets
 */
export async function updateGoogleSheetTitle(
  oAuthClient: OAuth2Client,
  spreadsheetId: string,
  newTitle: string
): Promise<void> {
  const sheets = google.sheets({ version: 'v4', auth: oAuthClient });
  await sheets.spreadsheets.batchUpdate({
    // spreadsheetId kommer her
    spreadsheetId,
    requestBody: {
      requests: [{
        updateSpreadsheetProperties: {
          // properties må kun indeholde felter fra SpreadsheetProperties
          properties: { title: newTitle },
          fields: 'title'
        }
      }]
    }
  });
}

export interface ParsedKeyword {
  adGroup: string;
  keyword: string;
  matchType: 'BROAD' | 'PHRASE' | 'EXACT';
  cpc?: number;
  rowIndex: number;
}

/**
 * Læs alle keywords fra fanen 'Keywords' og returnér med række-index.
 */
export async function parseKeywordsFromSheet(
  oAuthClient: OAuth2Client,
  sheetId: string
): Promise<ParsedKeyword[]> {
  const sheets = google.sheets({ version: 'v4', auth: oAuthClient });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'Keywords!A2:D'
  });
  const rows = res.data.values || [];
  return rows
    .map((r, i) => ({
      adGroup:   r[0] as string,
      keyword:   r[1] as string,
      matchType: (r[2] as string).toUpperCase() as any,
      cpc:       r[3] ? Number(r[3]) : undefined,
      rowIndex:  i + 2
    }))
    .filter(k => k.adGroup && k.keyword);
}

/**
 * Sync: slet gamle defs for sheet+user, indsæt nye batch-insert.
 */
export async function syncKeywordDefsFromSheet(
  oAuthClient: OAuth2Client,
  sheetId: string,
  userId: string
): Promise<ParsedKeyword[]> {
  const parsed = await parseKeywordsFromSheet(oAuthClient, sheetId);
  await connect();
  try {
    await KeywordDefModel.deleteMany({ sheetId, userId });
    const docs = parsed.map(k => ({
      userId,
      sheetId,
      adGroup: k.adGroup,
      keyword: k.keyword,
      matchType: k.matchType,
      cpc: k.cpc,
      rowIndex: k.rowIndex
    }));
    await KeywordDefModel.insertMany(docs);
  } finally {
    await disconnect();
  }
  return parsed;
}