import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

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


/* import { GoogleAdsApi } from 'google-ads-api';
import { IUser } from '../interfaces/iUser';

// Opretter Google Ads API-klient

export async function getAdsClient(user: IUser) {
    try {
        const client = new GoogleAdsApi({
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            developer_token: process.env.GOOGLE_DEVELOPER_TOKEN!,
        });

        return client.Customer({
            customer_id: process.env.GOOGLE_TEST_ACCOUNT_ID!,      // Testkontoens ID
            login_customer_id: process.env.GOOGLE_TEST_ACCOUNT_ID!, // Samme ID her
            refresh_token: user.refreshToken!,
        });
    } catch (error) {
        console.error("Fejl ved oprettelse af Google Ads klient: ", error);
        throw error;
    }
}
// Henter sheets fra Google Sheets API

 */