// controllers/syncSheetController.ts
import { Request, Response } from 'express';
import { syncSheetToAds } from '../services/syncSheetToAds';
import { createOAuthClient, getGoogleAccessToken } from '../services/googleAuthService';
import { connect, disconnect } from '../repository/database';

import { AuthenticatedRequest } from '../interfaces/userReq';

export async function syncSheetHandler(req: AuthenticatedRequest, res: Response) {
    try {
      await connect();
      const userId = req.params.userId;
  
      if (!req.user?.refreshToken) {
        throw new Error('Bruger har ikke refreshToken i JWT');
      }
  
      const oAuthClient = createOAuthClient();
      oAuthClient.setCredentials({ refresh_token: req.user.refreshToken }); // 👈 HER!
  
      const result = await syncSheetToAds(oAuthClient, userId);// Pass an appropriate value for p0
      res.status(200).json({ status: 'OK', result });
  
    } catch (error: any) {
      console.error('❌ Fejl i syncSheetHandler:', error.message);
      res.status(500).json({ error: error.message || 'Ukendt fejl' });
    } finally {
      await disconnect();
    }
  }


/* import { Request, Response } from 'express';
import { syncSheetToAds } from '../services/syncSheetToAds';
import { createOAuthClient } from '../services/googleAuthService';

export const syncSheetHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId; // eller fra req.user hvis du bruger auth
    const oAuthClient = createOAuthClient();

    const result = await syncSheetToAds(oAuthClient, userId);
    res.status(200).json({ success: true, statuses: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
 */