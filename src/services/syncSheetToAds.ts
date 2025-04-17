// syncSheetToAds.ts
import { ParsedCampaign, parseCampaignsFromSheet, writeStatusToSheet } from './googleSheetsService';
import { iUserModel } from '../models/iUserModel';
import { getGoogleAccessToken } from './googleAuthService'; // sørg for at stien er korrekt
import { OAuth2Client } from 'google-auth-library';

export async function syncSheetToAds(oAuthClient: OAuth2Client, userId: string): Promise<string[]> {
    const user = await iUserModel.findById(userId);
    if (!user || !user.googleAdsCustomerId || !user.sheetId || !user.refreshToken) {
      throw new Error('Bruger mangler nødvendige Google-integrationer');
    }
  
    const accessToken = await getGoogleAccessToken(user.refreshToken);
    const campaigns = await parseCampaignsFromSheet(oAuthClient, user.sheetId);
    const statuses: string[] = [];
  
    for (const campaign of campaigns) {
      try {
        // Step 1: Opret et campaign budget
        const budgetPayload = {
          mutateOperations: [
            {
              campaignBudgetOperation: {
                create: {
                  name: `${campaign.name}_budget_${Date.now()}`,
                  amountMicros: "0",
                  deliveryMethod: "STANDARD"
                }
              }
            }
          ]
        };
  
        const budgetRes = await fetch(`https://googleads.googleapis.com/v15/customers/${user.googleAdsCustomerId}/googleAds:mutate`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(budgetPayload)
        });
  
        if (!budgetRes.ok) {
          const errText = await budgetRes.text();
          throw new Error(`Fejl ved budget-oprettelse: ${budgetRes.status} - ${errText}`);
        }
  
        const budgetData = await budgetRes.json();
        const budgetResourceName = budgetData.mutateOperationResponses?.[0]?.campaignBudget?.resourceName;
        if (!budgetResourceName) throw new Error('Budget resource name mangler');
  
        // Step 2: Opret kampagnen med det oprettede budget
        const campaignPayload = {
          mutateOperations: [
            {
              campaignOperation: {
                create: {
                  name: campaign.name,
                  status: campaign.status,
                  advertisingChannelType: 'SEARCH',
                  manualCpc: {},
                  startDate: campaign.startDate.replace(/-/g, ''),
                  endDate: campaign.endDate.replace(/-/g, ''),
                  campaignBudget: budgetResourceName
                }
              }
            }
          ]
        };
  
        const campaignRes = await fetch(`https://googleads.googleapis.com/v15/customers/${user.googleAdsCustomerId}/googleAds:mutate`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(campaignPayload)
        });
  
        if (!campaignRes.ok) {
          const errText = await campaignRes.text();
          throw new Error(`Fejl fra kampagne-API: ${campaignRes.status} - ${errText}`);
        }
  
        statuses.push('✅ Oprettet');
      } catch (err: any) {
        statuses.push(`❌ Fejl: ${err.message || 'ukendt'}`);
      }
    }
  
    await writeStatusToSheet(oAuthClient, user.sheetId, statuses);
    return statuses;
  }