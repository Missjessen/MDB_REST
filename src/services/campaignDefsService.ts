// src/services/googleSheets/campaignSheetService.ts
import { google } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';
import { CampaignDefModel } from '../models/CampaignDefModel';
import type { ICampaignDef} from '../interfaces/iCampaignDef';
import { Types } from 'mongoose';



/**
 * Interfacet vi parser fra arket, inkl. rowIndex
 */
interface ParsedCampaign {
  name: string;
  status: 'ENABLED'|'PAUSED';
  budget?: number;
  startDate: string;
  endDate: string;
  rowIndex: number;
}

export async function parseCampaignsFromSheet(oauth:OAuth2Client, sheetId:string):Promise<ParsedCampaign[]> {
  const sheets = google.sheets({version:'v4',auth:oauth});
  const res = await sheets.spreadsheets.values.get({spreadsheetId:sheetId, range:'Kampagner!A2:E'});
  const rows = res.data.values||[];
  return rows
    .map<ParsedCampaign>((r,i)=>({
      name:String(r[0]||''),
      status:((r[1]||'').toString().toUpperCase()==='PAUSED'?'PAUSED':'ENABLED'),
      budget: r[2]!=null?Number(r[2]):undefined,
      startDate:String(r[3]||''), endDate:String(r[4]||''), rowIndex:i+2
    }))
    .filter(c=>c.name&&c.status&&c.startDate&&c.endDate);
}

export async function syncCampaignDefsFromSheet(
  oauth: OAuth2Client,
  sheetId: string,
  userId: string
): Promise<ParsedCampaign[]> {
  const parsed = await parseCampaignsFromSheet(oauth, sheetId);

  // Opdater DB uden at lukke forbindelsen
  await CampaignDefModel.deleteMany({ sheetId, userId });
  await CampaignDefModel.insertMany(
    parsed.map(c => ({
      userId:     new Types.ObjectId(userId),
      sheetId,
      campaignId: String(c.rowIndex),
      name:       c.name,
      status:     c.status,
      budget:     c.budget!,
      startDate:  c.startDate,
      endDate:    c.endDate,
      rowIndex:   c.rowIndex,
      createdAt:  new Date()
    } as Omit<ICampaignDef, '_id'>))
  );

  return parsed;
}

  
  /**
   * Opdater én celle-per-kolonne i rækken i arket.
   */
  // src/services/googleSheets/campaignSheetService.ts

export async function updateCampaignRowInSheet(
    oAuthClient: OAuth2Client,
    sheetId: string,
    rowIndex: number,
    updates: Partial<{ name:string; status:string; budget:number; startDate:string; endDate:string }>
  ): Promise<void> {
    const sheets = google.sheets({ version:'v4', auth: oAuthClient });
    const data: any[] = [];
    if (updates.name)      data.push({ range:`Kampagner!A${rowIndex}`, values:[[updates.name]] });
    if (updates.status)    data.push({ range:`Kampagner!B${rowIndex}`, values:[[updates.status]] });
    if (updates.budget!=null) data.push({ range:`Kampagner!C${rowIndex}`, values:[[updates.budget]] });
    if (updates.startDate) data.push({ range:`Kampagner!D${rowIndex}`, values:[[updates.startDate]] });
    if (updates.endDate)   data.push({ range:`Kampagner!E${rowIndex}`, values:[[updates.endDate]] });
  
    if (data.length) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: { valueInputOption:'RAW', data }
      });
    }
  }
  
  export async function deleteCampaignRowInSheet(
    oAuthClient: OAuth2Client,
    sheetId: string,
    rowIndex: number
  ): Promise<void> {
    const sheets = google.sheets({ version:'v4', auth: oAuthClient });
    const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
    const kampagneSheetId = meta.data.sheets!
      .find(s => s.properties!.title === 'Kampagner')!
      .properties!.sheetId!;
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId:    kampagneSheetId,
              dimension:  'ROWS',
              startIndex: rowIndex - 1,
              endIndex:   rowIndex
            }
          }
        }]
      }
    });
  }
  