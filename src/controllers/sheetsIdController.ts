// POST /api/google/sheet-id
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
  }
  
  // Controller til at oprette og gemme Sheet ID
  export const createAndSaveSheet = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
  
  