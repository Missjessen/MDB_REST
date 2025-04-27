/* // controllers/syncSheetController.ts – opdateret til ikke at lukke DB-session midt i kørsel
import { Request, Response } from 'express';
import { syncSheetToAds } from '../services/syncSheetToAds';
import { createOAuthClient } from '../services/googleAuthService';
import { connect } from '../repository/database';
import { AuthenticatedRequest } from '../interfaces/userReq';

export async function syncSheetHandler(req: AuthenticatedRequest, res: Response) {
  try {
    // Sikr at vi er forbundet til MongoDB
    await connect();

    const userId = req.params.userId;
    if (!req.user?.refreshToken) {
      throw new Error('Bruger har ikke refreshToken i JWT');
    }

    // Opret OAuth2-client og sæt refresh token
    const refreshToken = req.user!.refreshToken;
    const oAuthClient = createOAuthClient();
    oAuthClient.setCredentials({ refresh_token: refreshToken });

    // Kør sync-logic
    const result = await syncSheetToAds(oAuthClient, userId);
    res.status(200).json({ status: 'OK', result });
  } catch (error: any) {
    console.error('❌ Fejl i syncSheetHandler:', error);
    res.status(500).json({ error: error.message || 'Ukendt fejl' });
  }
} */