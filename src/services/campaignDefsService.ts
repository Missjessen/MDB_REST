// import { google } from 'googleapis';
// import { OAuth2Client } from 'google-auth-library';
// import { CampaignDefModel } from '../models/CampaignDefModel';

// /**
//  * Opdater en enkelt række (kampagne) i arket.
//  * @param oAuthClient - OAuth2-client med drive+sheet-scopes
//  * @param sheetId     - Spreadsheet ID
//  * @param campaignId  - Mongo _id som string
//  * @param updates     - Felter du gerne vil skrive (fx name, status, startDate, endDate)
//  */
// export async function updateCampaignRowInSheet(
//   oAuthClient: OAuth2Client,
//   sheetId: string,
//   campaignId: string,
//   updates: Partial<{ name:string; status:string; startDate:string; endDate:string; }>
// ) {
//   // 1) Hent rowIndex fra DB
//   const doc = await CampaignDefModel.findById(campaignId).lean();
//   if (!doc || doc.rowIndex == null) return;
  
//   const row = doc.rowIndex; // f.eks. 2 for A2:E2

//   const sheets = google.sheets({ version: 'v4', auth: oAuthClient });
//   const data: any[] = [];
//   if (updates.name)      data.push({ range: `Kampagner!A${row}:A${row}`, values:[[updates.name]] });
//   if (updates.status)    data.push({ range: `Kampagner!B${row}:B${row}`, values:[[updates.status]] });
//   if (updates.startDate) data.push({ range: `Kampagner!D${row}:D${row}`, values:[[updates.startDate]] });
//   if (updates.endDate)   data.push({ range: `Kampagner!E${row}:E${row}`, values:[[updates.endDate]] });

//   if (data.length === 0) return;

//   await sheets.spreadsheets.values.batchUpdate({
//     spreadsheetId: sheetId,
//     requestBody: {
//       valueInputOption: 'RAW',
//       data
//     }
//   });
// }

// /**
//  * Slet en række i arket (flyt alle underliggende rækker op én plads)
//  */
// export async function deleteCampaignRowInSheet(
//   oAuthClient: OAuth2Client,
//   sheetId: string,
//   campaignId: string
// ) {
//   const doc = await CampaignDefModel.findById(campaignId).lean();
//   if (!doc || doc.rowIndex == null) return;
//   const row = doc.rowIndex - 1; // zero-based for deleteDimension

//   const sheets = google.sheets({ version: 'v4', auth: oAuthClient });
//   await sheets.spreadsheets.batchUpdate({
//     spreadsheetId: sheetId,
//     requestBody: {
//       requests: [{
//         deleteDimension: {
//           range: {
//             sheetId: /* id-nummeret for “Kampagner”-fanen */,
//             dimension: 'ROWS',
//             startIndex: row,
//             endIndex: row + 1
//           }
//         }
//       }]
//     }
//   });
// }

// export async function syncCampaignDefsFromSheet(
//   oAuthClient: OAuth2Client,
//   sheetId: string,
//   userId: string
// ): Promise<string[]> {
//   const parsed = await parseCampaignsFromSheet(oAuthClient, sheetId); // med rowIndex
//   await connect();
//   try {
//     await CampaignDefModel.deleteMany({ sheetId, userId });
//     const docs = parsed.map(c => ({
//       userId,
//       sheetId,
//       name:      c.name,
//       status:    c.status,
//       startDate: c.startDate,
//       endDate:   c.endDate,
//       rowIndex:  c.rowIndex       // GEM rowIndex
//     }));
//     await CampaignDefModel.insertMany(docs);
//     return parsed.map(c => c.name);
//   } finally {
//     await disconnect();
//   }
// }


// // src/services/campaignDefsService.ts
// // import { OAuth2Client } from 'google-auth-library';
// // import { connect, disconnect } from '../repository/database';
// // import { CampaignDefModel } from '../models/CampaignDefModel';
// // import { parseCampaignsFromSheet, ParsedCampaign } from './googleSheetsService';

// // /**
// //  * Synkroniserer kampagne-definitions fra Google Sheet til MongoDB:
// //  *  1) Henter alle rækker fra arket
// //  *  2) Sletter eksisterende definitions for det pågældende sheet + bruger
// //  *  3) Indsætter de nye definitions i ét bulk-insert
// //  *
// //  * @param oAuthClient - OAuth2-klient med refresh token sat
// //  * @param sheetId     - Google Sheets ID
// //  * @param userId      - MongoDB ObjectId som string
// //  * @returns           - Liste af campaign-navne der blev synket
// //  */
// // export async function syncCampaignDefsFromSheet(
// //   oAuthClient: OAuth2Client,
// //   sheetId: string,
// //   userId: string
// // ): Promise<string[]> {
// //   // 1) parse Sheet-rækker til et array af ParsedCampaign
// //   const parsed: ParsedCampaign[] = await parseCampaignsFromSheet(oAuthClient, sheetId);

// //   // 2) åbn DB-forbindelse
// //   await connect();
// //   try {
// //     // 3) slet gamle definitions for netop det her sheet + user
// //     await CampaignDefModel.deleteMany({ sheetId, userId });

// //     // 4) bulk-opbyg docs til insert
// //     const docs = parsed.map(c => ({
// //       userId,
// //       sheetId,
// //       name: c.name,
// //       status: c.status,
// //       startDate: c.startDate,
// //       endDate: c.endDate
// //     }));

// //     // 5) indsæt alle på én gang
// //     await CampaignDefModel.insertMany(docs);

// //     // 6) returnér navnene som et simpelt status-array
// //     return parsed.map(c => c.name);
// //   } finally {
// //     // 7) luk DB-forbindelsen
// //     await disconnect();
// //   }
// // }



// /* // src/services/campaignDefsService.ts
// import { OAuth2Client } from 'google-auth-library';
// import { CampaignDefModel } from '../models/CampaignDefModel';
// import { parseCampaignsFromSheet, ParsedCampaign } from './googleSheetsService';

// /**
//  * Henter alle Kampagner fra Sheet og slaan op i DB under campaignDefs.
//  * Sletter gamle og gemmer nye.
//  */
// /* export async function syncCampaignDefsFromSheet(
//   oAuthClient: OAuth2Client,
//   sheetId: string,
//   userId: string
// ): Promise<string[]> {
//   // 1) parse rækker
//   const parsed: ParsedCampaign[] = await parseCampaignsFromSheet(oAuthClient, sheetId);
//   // 2) slet eksisterende defs for dette sheet
//   await CampaignDefModel.deleteMany({ sheetId, userId });
//   // 3) gem som docs
//   const docs = parsed.map(c => ({
//     userId,
//     sheetId,
//     name: c.name,
//     status: c.status,
//     startDate: c.startDate,
//     endDate: c.endDate
//   }));
//   await CampaignDefModel.insertMany(docs);
//   return parsed.map(c => c.name);
// }
//  */ 