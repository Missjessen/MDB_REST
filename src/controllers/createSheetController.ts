/* import { Response } from 'express';
import { AuthenticatedRequest } from '../interfaces/userReq';
import { createOAuthClient } from '../services/googleAuthService';
import { createUserSheet } from '../services/googleSheetsService';

export const createSheet = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const user = req.user;
  const { name } = req.body;

  if (!user?.refreshToken || !name) {
    res.status(400).json({ error: 'Bruger eller navn mangler' });
    return;
  }

  try {
    const oAuthClient = createOAuthClient();
    oAuthClient.setCredentials({ refresh_token: user.refreshToken });

    const sheetId = await createUserSheet(oAuthClient, name);

    res.status(201).json({
      message: '✅ Google Sheet oprettet',
      sheetId,
      sheetLink: `https://docs.google.com/spreadsheets/d/${sheetId}`
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Fejl ved oprettelse af sheet' });
  }
};
 */