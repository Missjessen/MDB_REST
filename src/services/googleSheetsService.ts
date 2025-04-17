import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { getGoogleAccessToken } from './googleAuthService';



/**
 * Opretter et Google Sheet med standardstruktur (Kampagner, Annoncer, Keywords, Forklaring)
 * @param oAuthClient - Google OAuth klient med refresh token sat
 * @param title - Titel på arket
 * @returns Sheet ID
 */
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

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: 'RAW',
      data: [
        {
          range: 'Kampagner!A1:E1',
          values: [['Campaign Name', 'Status', 'Budget', 'Start Date', 'End Date']]
        },
        {
          range: 'Annoncer!A1:F1',
          values: [['Ad Group', 'Headline 1', 'Headline 2', 'Description', 'Final URL', 'Path']]
        },
        {
          range: 'Keywords!A1:D1',
          values: [['Ad Group', 'Keyword', 'Match Type', 'CPC']]
        },
        {
          range: 'Forklaring!A1',
          values: [[
            'Dette ark er opdelt i 3 hovedark: Kampagner, Annoncer og Keywords.\n\n' +
            '- Udfyld en række pr. kampagne, annonce eller søgeord.\n' +
            '- Brug validerede værdier som status = Enabled/Paused, matchtype = Broad/Phrase/Exact.\n' +
            '- Dette ark er forbundet til Google Ads API og kan automatisk synkroniseres.'
          ]]
        }
      ]
    }
  });

  const requests = ['Kampagner', 'Annoncer', 'Keywords'].map(sheetName => ({
    repeatCell: {
      range: {
        sheetId: sheetIdMap[sheetName],
        startRowIndex: 0,
        endRowIndex: 1
      },
      cell: {
        userEnteredFormat: {
          backgroundColor: { red: 1, green: 0.95, blue: 0.75 },
          textFormat: { bold: true }
        }
      },
      fields: 'userEnteredFormat(backgroundColor,textFormat)'
    }
  }));

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests }
  });

  return spreadsheetId;
}
// googleSheetsService.ts

import fetch from 'node-fetch';


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