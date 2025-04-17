// services/campaignService.ts
import { parseCampaignsFromSheet } from './googleSheetsService';
import { iUserModel } from '../models/iUserModel';
import { CampaignModel } from '../models/CampaignModel';
import { OAuth2Client } from 'google-auth-library';

export async function saveCampaignsFromSheetToDB(oAuthClient: OAuth2Client, userId: string): Promise<string[]> {
  const user = await iUserModel.findById(userId);
  if (!user || !user.sheetId) throw new Error('Bruger eller Sheet ID mangler');

  const campaigns = await parseCampaignsFromSheet(oAuthClient, user.sheetId);
  const results: string[] = [];

  for (const campaign of campaigns) {
    try {
      await CampaignModel.create({
        userId,
        sheetId: user.sheetId,
        name: campaign.name,
        status: campaign.status,
        startDate: campaign.startDate,
        endDate: campaign.endDate
      });
      results.push(`✅ ${campaign.name} gemt`);
    } catch (err: any) {
      results.push(`❌ ${campaign.name} fejl: ${err.message}`);
    }
  }

  return results;
}
