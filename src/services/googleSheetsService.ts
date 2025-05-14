// src/services/googleSheetsService.ts
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { iUserModel } from '../models/iUserModel';
import { createOAuthClient, getGoogleAccessToken } from './googleAuthService';

/**
 * Oprindelig funktion — uændret
 */
export async function createUserSheet(
  oAuthClient: OAuth2Client,
  title: string
): Promise<string> {
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
  // Sæt headers…
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: 'RAW',
      data: [
        { range: 'Kampagner!A1:E1', values: [['Campaign Name','Status','Budget','Start Date','End Date']] },
        { range: 'Annoncer!A1:F1', values: [['Ad Group','Headline 1','Headline 2','Description','Final URL','Path']] },
        { range: 'Keywords!A1:D1',  values: [['Ad Group','Keyword','Match Type','CPC']] },
        { range: 'Forklaring!A1',   values: [[
            'Dette ark…'
        ]] }
      ]
    }
  });
  // Farv headers…
  const requests = ['Kampagner','Annoncer','Keywords'].map(name => ({
    repeatCell: {
      range: { sheetId: sheetIdMap[name], startRowIndex:0, endRowIndex:1 },
      cell:  { userEnteredFormat: { backgroundColor:{ red:1,green:0.95,blue:0.75 }, textFormat:{ bold:true } } },
      fields:'userEnteredFormat(backgroundColor,textFormat)'
    }
  }));
  await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody:{ requests } });
  return spreadsheetId;
}

/**
 * Helper: Bygger og returnerer en OAuth2Client, der
 * automatisk har fornyet access_token sat via refresh_token fra DB.
 */
async function getAuthClientForUser(userId: string): Promise<OAuth2Client> {
  const user = await iUserModel.findById(userId);
  if (!user || !user.refreshToken) {
    throw new Error('Bruger har ingen refreshToken');
  }
  const client = createOAuthClient();
  // sæt refresh token
  client.setCredentials({ refresh_token: user.refreshToken });
  // forny access token
  const freshToken = await getGoogleAccessToken(user.refreshToken);
  client.setCredentials({ access_token: freshToken });
  return client;
}

/**
 * Eksportér en version, der kun kræver userId + title.
 * Controlleren kan så kalde denne direkte.
 */
export async function createUserSheetFor(
  userId: string,
  title: string
): Promise<string> {
  const client = await getAuthClientForUser(userId);
  return createUserSheet(client, title);
}

