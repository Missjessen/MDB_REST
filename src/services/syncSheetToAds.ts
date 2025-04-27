
// services/syncSheetToAds.ts
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Types } from 'mongoose';
import { CampaignDefModel } from '../models/CampaignDefModel';
import {
  callAdsApiCampaignMutate,
  callAdsApiAdGroupMutate,
  callAdsApiAdMutate,
  callAdsApiCriterionMutate
} from '../services/adsService';

/**
 * Synkroniserer alle resources fra "AllResources"-sheet til DB og Google Ads.
 */
export async function syncSheetToAds(
  oAuthClient: OAuth2Client,
  spreadsheetId: string,
  userId: string
): Promise<void> {
  const sheets = google.sheets({ version: 'v4', auth: oAuthClient });
  const res    = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'AllResources!A2:P1000' });
  const rows   = res.data.values || [];
  if (!rows.length) return;

  const campaignOps: any[] = [];
  const adGroupOps:   any[] = [];
  const adOps:        any[] = [];
  const criterionOps: any[] = [];

  const statuses: string[] = [];
  for (const row of rows) {
    const [
      resourceType, id, parentId, name, budget, status,
      startDate, endDate, headline1, headline2,
      description, finalUrl, keywordText, matchType,
      action
    ] = row;

    if (!action) {
      statuses.push('');
      continue;
    }

    try {
      if (resourceType === 'campaign') {
        // Opdater DB
        await CampaignDefModel.findOneAndUpdate(
          { sheetId: spreadsheetId, id },
          {
            userId:    new Types.ObjectId(userId),
            sheetId:   spreadsheetId,
            id,
            name,
            status,
            startDate,
            endDate
          },
          { upsert: true, new: true }
        );
        campaignOps.push({ id, name, budget, status, startDate, endDate, action });
      } else if (resourceType === 'adGroup') {
        adGroupOps.push({ id, parentId, name, status, action });
      } else if (resourceType === 'ad') {
        adOps.push({ parentId, headline1, headline2, description, finalUrl, action });
      } else if (resourceType === 'keyword') {
        criterionOps.push({ parentId, keywordText, matchType, action });
      }
      statuses.push('Pending');
    } catch (err:any) {
      statuses.push(`Error: ${err.message}`);
    }
  }

  // Kald Google Ads API batch-mutate for hver resourcetype
  await callAdsApiCampaignMutate(campaignOps);
  await callAdsApiAdGroupMutate(adGroupOps);
  await callAdsApiAdMutate(adOps);
  await callAdsApiCriterionMutate(criterionOps);

  // Skriv syncStatus tilbage
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `AllResources!P2:P${statuses.length+1}`,
    valueInputOption: 'RAW',
    requestBody: { values: statuses.map(s => [s]) }
  });
}




/* // syncSheetToAds.ts – revideret med login-customer-id for test accounts og debug-logs
import fetch from 'node-fetch';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { iUserModel } from '../models/iUserModel';
import { getGoogleAccessToken } from './googleAuthService';


const API_VERSION = 'v18';
const TEST_CUSTOMER_ID: string = process.env.GOOGLE_ADS_TEST_CUSTOMER_ID!;
const DEVELOPER_TOKEN: string = process.env.GOOGLE_DEVELOPER_TOKEN!;
const LOGIN_CUSTOMER_ID: string = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID!;
if (!TEST_CUSTOMER_ID || !DEVELOPER_TOKEN || !LOGIN_CUSTOMER_ID) {
  throw new Error('Manglende .env variabler: GOOGLE_ADS_TEST_CUSTOMER_ID, GOOGLE_DEVELOPER_TOKEN eller GOOGLE_ADS_LOGIN_CUSTOMER_ID');
}

export interface ParsedCampaign {
  name: string;
  status: 'ENABLED' | 'PAUSED';
  startDate: string;
  endDate: string;
}

async function* parseCampaignsInBatches(
  oAuthClient: OAuth2Client,
  sheetId: string,
  batchSize = 100
): AsyncGenerator<ParsedCampaign> {
  const sheets = google.sheets({ version: 'v4', auth: oAuthClient });
  let startRow = 2;
  while (true) {
    const endRow = startRow + batchSize - 1;
    const range = `Kampagner!A${startRow}:E${endRow}`;
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
    const rows = res.data.values;
    console.log(`DEBUG: Hentede ${rows?.length ?? 0} rækker fra range ${range}`);
    if (!rows || rows.length === 0) break;
    for (const [name, status, , startDate, endDate] of rows) {
      if (!name || !status || !startDate || !endDate) continue;
      yield {
        name,
        status: status.toUpperCase() === 'PAUSED' ? 'PAUSED' : 'ENABLED',
        startDate,
        endDate,
      };
    }
    if (rows.length < batchSize) break;
    startRow += batchSize;
  }
}

async function writeStatusBatch(
  oAuthClient: OAuth2Client,
  sheetId: string,
  statuses: string[],
  startRow: number
) {
  const sheets = google.sheets({ version: 'v4', auth: oAuthClient });
  const endRow = startRow + statuses.length - 1;
  console.log(`DEBUG: Skriver ${statuses.length} statusser til Kampagner!F${startRow}:F${endRow}`);
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `Kampagner!F${startRow}:F${endRow}`,
    valueInputOption: 'RAW',
    requestBody: { values: statuses.map(s => [s]) },
  });
}

export async function syncSheetToAds(
  oAuthClient: OAuth2Client,
  userId: string
): Promise<string[]> {
  console.log(`DEBUG: Starter sync for user ${userId}`);
  const user = await iUserModel.findById(userId);
  if (!user || !user.sheetId || !user.refreshToken) {
    throw new Error('Bruger mangler nødvendige Google-integrationer');
  }
  const accessToken = await getGoogleAccessToken(user.refreshToken);
  oAuthClient.setCredentials({ access_token: accessToken });

  const batchSize = 50;
  let rowOffset = 2;
  const allStatuses: string[] = [];
  let currentBatch: string[] = [];

  for await (const campaign of parseCampaignsInBatches(oAuthClient, user.sheetId, batchSize)) {
    console.log(`DEBUG: Behandler kampagne ${campaign.name}`);
    try {
      const budgetPayload = {
        operations: [{
          create: {
            name: `${campaign.name}_budget_${Date.now()}`,
            amountMicros: 0,
            deliveryMethod: 'STANDARD',
          },
        }],
      };
      const budgetRes = await fetch(
        `https://googleads.googleapis.com/${API_VERSION}/customers/${TEST_CUSTOMER_ID}/campaignBudgets:mutate`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'developer-token': DEVELOPER_TOKEN,
            'login-customer-id': LOGIN_CUSTOMER_ID,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(budgetPayload),
        }
      );
      if (!budgetRes.ok) {
        const errorText = await budgetRes.text();
        throw new Error(`Fejl ved budget-oprettelse: ${budgetRes.status} - ${errorText}`);
      }
      interface BudgetResponse { results: Array<{ resourceName: string }> }
      const budgetJson = (await budgetRes.json()) as BudgetResponse;
      const results = budgetJson.results;
      const budgetResourceName = results[0]?.resourceName;
      if (!budgetResourceName) throw new Error('Budget resourceName mangler');

      const campaignPayload = {
        operations: [{
          create: {
            name: campaign.name,
            status: campaign.status,
            advertisingChannelType: 'SEARCH',
            manualCpc: {},
            startDate: campaign.startDate.replace(/-/g, ''),
            endDate: campaign.endDate.replace(/-/g, ''),
            campaignBudget: budgetResourceName,
          },
        }],
      };
      const campaignRes = await fetch(
        `https://googleads.googleapis.com/${API_VERSION}/customers/${TEST_CUSTOMER_ID}/campaigns:mutate`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'developer-token': DEVELOPER_TOKEN,
            'login-customer-id': LOGIN_CUSTOMER_ID,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(campaignPayload),
        }
      );
      if (!campaignRes.ok) {
        const errorText = await campaignRes.text();
        throw new Error(`Fejl ved kampagne-oprettelse: ${campaignRes.status} - ${errorText}`);
      }

      currentBatch.push('✅ Oprettet');
      allStatuses.push('✅ Oprettet');
    } catch (err: any) {
      console.error(`ERROR handling campaign ${campaign.name}:`, err);
      const msg = err.message || 'ukendt';
      currentBatch.push(`❌ Fejl: ${msg}`);
      allStatuses.push(`❌ Fejl: ${msg}`);
    }
    if (currentBatch.length >= batchSize) {
      await writeStatusBatch(oAuthClient, user.sheetId, currentBatch, rowOffset);
      rowOffset += currentBatch.length;
      currentBatch = [];
    }
  }
  if (currentBatch.length) {
    await writeStatusBatch(oAuthClient, user.sheetId, currentBatch, rowOffset);
  }
  console.log('DEBUG: Sync færdig, total statusser:', allStatuses.length);
  return allStatuses;
} */