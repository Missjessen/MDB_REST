// src/services/googleSheets/campaignSheetService.ts
import { google } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';
import { connect, disconnect } from '../repository/database';
import { CampaignDefModel } from '../models/CampaignDefModel';
import type { ICampaignDef} from '../interfaces/iCampaignDef';
import { Types } from 'mongoose';


/**
 * Interfacet vi parser fra arket, inkl. rowIndex
 */
interface ParsedCampaign {
    name:      string;
    status:    'ENABLED' | 'PAUSED';
    budget?:   number;
    startDate: string;
    endDate:   string;
    rowIndex:  number;
  }
  
  export async function parseCampaignsFromSheet(
    oAuthClient: OAuth2Client,
    sheetId: string
  ): Promise<ParsedCampaign[]> {
    const sheets = google.sheets({ version: 'v4', auth: oAuthClient });
    const res     = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Kampagner!A2:E'
    });
    const rows = res.data.values || [];
  
    return rows
      .map<ParsedCampaign>((r, i) => {
        const nameCell      = r[0] ?? '';
        const rawStatus     = String(r[1] ?? '').toUpperCase();
        const budgetCell    = r[2] != null ? Number(r[2]) : undefined;
        const startDateCell = r[3] ?? '';
        const endDateCell   = r[4] ?? '';
        // Sørg for at status kun kan være én af de to
        const status: ParsedCampaign['status'] = rawStatus === 'PAUSED' ? 'PAUSED' : 'ENABLED';
  
        return {
          name:      String(nameCell),
          status,   // allerede korrekt typet
          budget:    budgetCell,
          startDate: String(startDateCell),
          endDate:   String(endDateCell),
          rowIndex:  i + 2
        };
      })
      .filter(c => c.name && c.status && c.startDate && c.endDate);
  }
  /**
   * Synkroniser DB med arket: slet gamle + bulk-insert nye inkl. rowIndex.
   */
  export async function syncCampaignDefsFromSheet(
    oAuthClient: OAuth2Client,
    sheetId: string,
    userId: string
  ): Promise<ParsedCampaign[]> {
    const parsed = await parseCampaignsFromSheet(oAuthClient, sheetId);
  
    await connect();
    try {
      // Ryd gamle defs
      await CampaignDefModel.deleteMany({ sheetId, userId });
  
      // Byg de dokumenter, vi vil gemme
      const docs: Array<Omit<ICampaignDef, '_id'>> = parsed.map(c => ({
        userId:     new Types.ObjectId(userId),   // konverter str til ObjectId
        sheetId,
        campaignId: String(c.rowIndex),           // rowIndex som unik nøgle
        name:       c.name,
        status:     c.status,
        budget:     c.budget,
        startDate:  c.startDate,
        endDate:    c.endDate,
        rowIndex:   c.rowIndex,
        // createdAt springer vi over, Mongoose bruger schema-default
      }));
  
      // Bulk-indsæt i Mongo
      await CampaignDefModel.insertMany(docs);
    } finally {
      await disconnect();
    }
  
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
  