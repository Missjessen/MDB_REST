/* import { google } from 'googleapis';
import fetch from 'node-fetch';
import { OAuth2Client } from 'google-auth-library';
import { ICampaign } from '../interfaces/ICampaign';
import { getGoogleAccessToken } from './googleAuthService';

const BATCH_SIZE = 100;
const SHEETS_API_VER = 'v4';
 */
/**
 * Henter rækker i batches fra Google Sheets
 */
/* async function* parseCampaignsInBatches(
  oAuth: OAuth2Client,
  sheetId: string
): AsyncGenerator<ICampaign> {
  const sheets = google.sheets({ version: SHEETS_API_VER, auth: oAuth });
  let startRow = 2;

  while (true) {
    const endRow = startRow + BATCH_SIZE - 1;
    const range = `Kampagner!A${startRow}:E${endRow}`;
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
    const rows = res.data.values;
    if (!rows || rows.length === 0) break;

    for (const [name, status, , startDate, endDate] of rows) {
      if (!name || !status || !startDate || !endDate) continue;
      yield { name, status: status.toUpperCase() as 'ENABLED'|'PAUSED', startDate, endDate };
    }
    if (rows.length < BATCH_SIZE) break;
    startRow += BATCH_SIZE;
  }
}
 */
/**
 * Sync fra Sheet til MongoDB CampaignDef.
 */
/* export async function syncSheetToDb(
  oAuth: OAuth2Client,
  userId: string,
  sheetId: string
): Promise<string[]> {
  // Sørg for gyldigt access token
  const token = await getGoogleAccessToken(oAuth.credentials.refresh_token!);
  oAuth.setCredentials({ access_token: token });

  const statuses: string[] = [];
  for await (const camp of parseCampaignsInBatches(oAuth, sheetId)) {
    try {
      // Upsert (gem ny eller opdatér eksisterende)
      await CampaignDefModel.findOneAndUpdate(
        { userId, sheetId, name: camp.name },
        { $set: { ...camp, userId, sheetId } },
        { upsert: true }
      );
      statuses.push(`✅ ${camp.name}`);
    } catch (e: any) {
      statuses.push(`❌ ${camp.name}: ${e.message}`);
    }
  }
  return statuses;
} */
