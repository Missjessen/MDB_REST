import { Response } from 'express';
import { connect, disconnect } from '../repository/database';
import { iUserModel } from '../models/iUserModel';
import { google } from 'googleapis';
import { AuthenticatedRequest } from '../interfaces/userReq';
import { createUserSheet } from '../services/googleSheetsService';

/**
 * Opretter og tilknytter et Google Sheet til en bruger.
 * Kræver at brugeren er logget ind og har refreshToken.
 * 
 * @route POST /api/google/create-sheet
 */
export const createAndSaveSheet = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: "Login kræves" });
    return;
  }

  try {
    await connect();

    const userDoc = await iUserModel.findById(user._id);
    if (!userDoc || !userDoc.refreshToken) {
      res.status(404).json({ error: "Bruger eller refreshToken ikke fundet" });
      return;
    }

    const oAuthClient = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID!,
      process.env.GOOGLE_CLIENT_SECRET!,
      process.env.GOOGLE_REDIRECT_URI!
    );

    oAuthClient.setCredentials({ refresh_token: userDoc.refreshToken });

    const sheetId = await createUserSheet(oAuthClient, `Ads Sheet - ${userDoc.email}`);
    userDoc.sheetId = sheetId;
    await userDoc.save();

    res.status(200).json({
      message: "Google Sheet oprettet og tilføjet til bruger",
      sheetId,
      sheetLink: `https://docs.google.com/spreadsheets/d/${sheetId}`
    });

  } catch (error) {
    res.status(500).json({ error: "Fejl under oprettelse af Sheet: " + error });
  } finally {
    await disconnect();
  }
};


/**
 * Returnerer link til brugerens Google Sheet
 * @route GET /api/google/sheet-link
 */
export const getSheetLink = async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: "Login kræves" });
  }

  try {
    await connect();
    const userDoc = await iUserModel.findById(user._id);

    if (!userDoc?.sheetId) {
      return res.status(404).json({ error: "Intet Google Sheet er tilknyttet bruger" });
    }

    const link = `https://docs.google.com/spreadsheets/d/${userDoc.sheetId}`;
    res.status(200).json({ sheetId: userDoc.sheetId, sheetLink: link });

  } catch (err) {
    res.status(500).json({ error: "Fejl ved hentning af Sheet ID: " + err });
  } finally {
    await disconnect();
  }
};








/* // POST /api/google/sheet-id
import { RequestHandler } from 'express';
import { Response } from 'express';
import { connect, disconnect } from '../repository/database';
import { iUserModel } from '../models/iUserModel';
import { google } from 'googleapis';
//import { AuthenticatedRequest } from '../middleware/requireAuth';
import { OAuth2Client } from 'google-auth-library';
import { JwtUserPayload, AuthenticatedRequest } from '../interfaces/userReq' 


export const setSheetId: RequestHandler = async (req, res): Promise<void> => {
    const { userId, sheetId } = req.body;
  
    if (!userId || !sheetId || sheetId.length < 10) {
      res.status(400).json({ error: "Ugyldigt eller manglende bruger/sheet ID" });
      return;
    }
  
    try {
      await connect();
  
      const updatedUser = await iUserModel.findByIdAndUpdate(
        userId,
        { sheetId },
        { new: true }
      );
  
      if (!updatedUser) {
        res.status(404).json({ error: "Bruger ikke fundet" });
        return;
      }
  
      res.status(200).json({ message: 'Google Sheet ID tilføjet', updatedUser });
    } catch (error) {
      res.status(500).json({ error: 'Fejl ved opdatering af Sheet ID: ' + error });
    } finally {
      await disconnect();
    }
  };




  // Opret Google Sheet via API
  export async function createUserSheet(oAuthClient: OAuth2Client, title: string): Promise<string> {
    const sheets = google.sheets({ version: 'v4', auth: oAuthClient });
  
    // Step 1: Opret regnearket med flere faner
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
  
    // Step 2: Tilføj kolonneoverskrifter
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
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
        ],
        valueInputOption: 'RAW'
      }
    });
  
    // Step 3: Farv overskriftsrækker (lys gul) og gør tekst fed
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
  } */
 /*  export async function createUserSheet(oAuthClient: OAuth2Client, title: string): Promise<string> {
    const sheets = google.sheets({ version: 'v4', auth: oAuthClient });
  
    const response = await sheets.spreadsheets.create({
      requestBody: {
        properties: { title },
        sheets: [
          {
            properties: { title: 'Kampagner' }
          }
        ]
      }
    });
  
    const spreadsheetId = response.data.spreadsheetId;
  
    await sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId!,
      range: 'Kampagner!A1:E1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [
          ['Campaign', 'Headline', 'Description', 'Keyword', 'Budget']
        ]
      }
    });
  
    return spreadsheetId!;
  } */
  
  // Controller til at oprette og gemme Sheet ID
  /* export const createAndSaveSheet = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: "Login kræves" });
      return;
    }
  
    
    try {
      await connect();
  
      const userDoc = await iUserModel.findById(user._id);// ✅ Nu virker denne uden TypeScript-fejl
  

      if (!userDoc) {
        res.status(404).json({ error: "Bruger ikke fundet" });
        return;
      }
  
      const oAuthClient = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID!,
        process.env.GOOGLE_CLIENT_SECRET!,
        process.env.GOOGLE_REDIRECT_URI!
      );
  
      oAuthClient.setCredentials({
        refresh_token: userDoc.refreshToken
      });
  
      const sheetId = await createUserSheet(oAuthClient, `Ads Sheet - ${userDoc.email}`);
      userDoc.sheetId = sheetId;
      await userDoc.save();
  
      res.status(200).json({
        message: "Google Sheet oprettet og tilføjet til bruger",
        sheetId,
        sheetLink: `https://docs.google.com/spreadsheets/d/${sheetId}`
      });
    } catch (error) {
      res.status(500).json({ error: "Fejl under oprettelse af Sheet: " + error });
    } finally {
      await disconnect();
    }
  };
  
   */