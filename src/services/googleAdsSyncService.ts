/* import { getAdsClient } from './googleAdsService';
import { OAuth2Client } from 'google-auth-library';
import { iUserModel } from '../models/iUserModel';
import { google } from 'googleapis';




// syncSheetToAds.ts
import { ParsedCampaign, parseCampaignsFromSheet } from './googleSheetsService';

export async function syncSheetToAds(oAuthClient: OAuth2Client, userId: string): Promise<string[]> {
    const user = await iUserModel.findById(userId);
    if (!user || !user.googleAdsCustomerId || !user.sheetId || !user.refreshToken) {
      throw new Error('Bruger mangler nødvendige Google-integrationer');
    }
  
    const campaigns = await parseCampaignsFromSheet(oAuthClient, user.sheetId);
    const client = await getAdsClient(user);
  
    const statuses: string[] = [];
    for (const campaign of campaigns) {
      try {
        const budget = await client.campaignBudgets.create([
          {
            amount_micros: 0,
            delivery_method: 'STANDARD',
            name: `Budget_${Date.now()}`
          }
        ]);
  
        const budgetResource = budget.results?.[0]?.resource_name || '';
  
        await client.campaigns.create([{
          name: campaign.name,
          status: campaign.status,
          advertising_channel_type: 'SEARCH',
          start_date: campaign.startDate.replace(/-/g, ''),
          end_date: campaign.endDate.replace(/-/g, ''),
          campaign_budget: budgetResource
        }]);
  
        statuses.push('✅ Oprettet');
      } catch (err: any) {
        statuses.push(`❌ Fejl: ${err.message || 'ukendt'}`);
      }
    }
  
    await writeStatusToSheet(oAuthClient, user.sheetId, statuses);
    return statuses;
  }
  
async function writeStatusToSheet(oAuthClient: OAuth2Client, sheetId: string, statuses: string[]): Promise<void> {
    const sheets = google.sheets({ version: 'v4', auth: oAuthClient });

    const values = statuses.map((status) => [status]);

    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: 'Statuses!A1', // Assuming there's a "Statuses" sheet and data starts at A1
            valueInputOption: 'RAW',
            requestBody: {
                values,
            },
        });
    } catch (error: any) {
        throw new Error(`Failed to write statuses to sheet: ${error.message || 'Unknown error'}`);
    }
}
 */