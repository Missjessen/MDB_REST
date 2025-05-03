// src/services/adDefsService.ts
import { OAuth2Client } from 'google-auth-library';
import { connect, disconnect } from '../repository/database';
import { AdDefModel } from '../models/AdDefModel';
//import { parseAdsFromSheet } from './googleSheetsService';
import { google } from 'googleapis';
import type { IAdDef } from '../interfaces/iAdDef';
import { Types } from 'mongoose';


// src/services/googleSheets/adSheetService.ts


interface ParsedAd {
  adGroup:    string;
  headline1:  string;
  headline2?: string;
  description:string;
  finalUrl:   string;
  path1?:     string;
  path2?:     string;
  rowIndex:   number;
}

/** Læs alle Ads + række-nummer */
export async function parseAdsFromSheet(
  oAuthClient: OAuth2Client,
  sheetId: string
): Promise<ParsedAd[]> {
  const sheets = google.sheets({ version:'v4', auth: oAuthClient });
  const resp   = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'Annoncer!A2:F'
  });
  const rows = resp.data.values || [];
  return rows
    .map<ParsedAd>((r,i) => ({
      adGroup:    String(r[0]||''),
      headline1:  String(r[1]||''),
      headline2:  r[2] ? String(r[2]) : undefined,
      description:String(r[3]||''),
      finalUrl:   String(r[4]||''),
      path1:      r[5] ? String(r[5]) : undefined,
      path2:      undefined,  // udvid efter behov
      rowIndex:   i+2
    }))
    .filter(a => a.adGroup && a.headline1 && a.description && a.finalUrl);
}

/** Sync Ads fra Sheet til MongoDB */
export async function syncAdDefsFromSheet(
  oAuthClient: OAuth2Client,
  sheetId: string,
  userId: string
): Promise<ParsedAd[]> {
  const parsed = await parseAdsFromSheet(oAuthClient, sheetId);

  await connect();
  try {
    // Slet eksisterende
    await AdDefModel.deleteMany({ sheetId, userId });
    // Bulk-insert
    const docs: Array<Omit<IAdDef,'_id'>> = parsed.map(a => ({
      userId:     new Types.ObjectId(userId),
      sheetId,
      adGroup:    a.adGroup,
      headline1:  a.headline1,
      headline2:  a.headline2,
      description:a.description,
      finalUrl:   a.finalUrl,
      path1:      a.path1,
      path2:      a.path2,
      rowIndex:   a.rowIndex,
      createdAt:  new Date()
    }));
    await AdDefModel.insertMany(docs);
  } finally {
    await disconnect();
  }
  return parsed;
}

/** Opdater én række i Sheet efter DB-opdatering */
export async function updateAdRowInSheet(
  oAuthClient: OAuth2Client,
  sheetId: string,
  adId: string,
  updates: Partial<{
    adGroup:string; headline1:string; headline2:string;
    description:string; finalUrl:string; path1:string; path2:string;
  }>
): Promise<void> {
  const doc = await AdDefModel.findById(adId).lean();
  if (!doc?.rowIndex) return;
  const row = doc.rowIndex;
  const sheets = google.sheets({ version:'v4', auth: oAuthClient });
  const data: { range:string; values:unknown[][] }[] = [];

  if (updates.adGroup)    data.push({ range:`Annoncer!A${row}`, values:[[updates.adGroup]] });
  if (updates.headline1)  data.push({ range:`Annoncer!B${row}`, values:[[updates.headline1]] });
  if (updates.headline2)  data.push({ range:`Annoncer!C${row}`, values:[[updates.headline2]] });
  if (updates.description)data.push({ range:`Annoncer!D${row}`, values:[[updates.description]] });
  if (updates.finalUrl)   data.push({ range:`Annoncer!E${row}`, values:[[updates.finalUrl]] });
  if (updates.path1)      data.push({ range:`Annoncer!F${row}`, values:[[updates.path1]] });
  // path2 kunne være G…

  if (data.length) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: { valueInputOption:'RAW', data }
    });
  }
}

/** Slet én række i Sheet */
export async function deleteAdRowInSheet(
  oAuthClient: OAuth2Client,
  sheetId: string,
  adId: string
): Promise<void> {
  const doc = await AdDefModel.findById(adId).lean();
  if (!doc?.rowIndex) return;
  const sheets = google.sheets({ version:'v4', auth: oAuthClient });
  // find sheetId´en for fanen “Annoncer”
  const info = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
  const announcerId = info.data.sheets!
    .find(s => s.properties!.title === 'Annoncer')!
    .properties!.sheetId!;
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: sheetId,
    requestBody: {
      requests: [{
        deleteDimension:{
          range:{
            sheetId:    announcerId,
            dimension:  'ROWS',
            startIndex: doc.rowIndex-1,
            endIndex:   doc.rowIndex
          }
        }
      }]
    }
  });
}


// /* export interface ParsedAd {
//     adGroup:    string;
//     headline1:  string;
//     headline2?: string;
//     description:string;
//     finalUrl:   string;
//     path1?:     string;
//     path2?:     string;
//     rowIndex:   number;
//   }
  
// //   /** Læs alle annoncer fra fanen 'Annoncer' */
// //   export async function parseAdsFromSheet(
// //     oAuthClient: OAuth2Client,
// //     sheetId: string
// //   ): Promise<ParsedAd[]> {
// //     const sheets = google.sheets({ version:'v4', auth: oAuthClient });
// //     const res = await sheets.spreadsheets.values.get({
// //       spreadsheetId: sheetId,
// //       range: 'Annoncer!A2:F'
// //     });
// //     const rows = res.data.values || [];
// //     return rows
// //       .map((r,i) => ({
// //          adGroup:    r[0] as string,
// //          headline1:  r[1] as string,
// //          headline2:  r[2] as string,
// //          description:r[3] as string,
// //          finalUrl:   r[4] as string,
// //          path1:      r[5] as string,
// //          path2:      undefined,
// //          rowIndex:   i+2
// //       }))
// //       .filter(a => a.adGroup && a.headline1 && a.description && a.finalUrl);
// //   }
  
//   /**
//    * Sync: fjern gamle annoncer, bulk-indsæt nye
//    */
//   export async function syncAdDefsFromSheet(
//     oAuthClient: OAuth2Client,
//     sheetId: string,
//     userId: string
//   ): Promise<ParsedAd[]> {
//     const parsed = await parseAdsFromSheet(oAuthClient, sheetId);
//     await connect();
//     try {
//       await AdDefModel.deleteMany({ sheetId, userId });
//       const docs = parsed.map(a => ({
//         userId,
//         sheetId,
//         adGroup:    a.adGroup,
//         headline1:  a.headline1,
//         headline2:  a.headline2,
//         description:a.description,
//         finalUrl:   a.finalUrl,
//         path1:      a.path1,
//         path2:      a.path2,
//         rowIndex:   a.rowIndex
//       }));
//       await AdDefModel.insertMany(docs);
//     } finally {
//       await disconnect();
//     }
//     return parsed;
//   }

// // export async function syncAdDefsFromSheet(
// //   oAuthClient: OAuth2Client,
// //   sheetId: string,
// //   userId: string
// // ): Promise<void> {
// //   const parsed = await parseAdsFromSheet(oAuthClient, sheetId);
// //   await connect();
// //   try {
// //     await AdDefModel.deleteMany({ sheetId, userId });
// //     const docs = parsed.map(a => ({ ...a, userId, sheetId }));
// //     await AdDefModel.insertMany(docs);
// //   } finally {
// //     await disconnect();
// //   }
// // }
 