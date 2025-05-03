// src/controllers/sheetsController.ts
import { RequestHandler } from 'express';
import { createOAuthClient } from '../services/googleAuthService';
import { syncCampaignDefsFromSheet } from '../services/campaignDefsService';
import { syncAdDefsFromSheet }       from '../services/adDefsService';
import { syncKeywordDefsFromSheet }  from '../services/keywordDefsService';
import { connect, disconnect }       from '../repository/database';
import { AuthenticatedRequest }      from '../interfaces/userReq';

export const syncAllFromSheet: RequestHandler = async (req, res) => {
  const user = (req as AuthenticatedRequest).user;
  const { sheetId } = req.params;

  if (!user || !user.refreshToken) {
    res.status(401).json({ error: 'Login kræves' });
    return;  // vigtigt: returnere void, ikke `return res.json(...)`
  }

  // 1) Byg OAuth-client
  const oauth = createOAuthClient();
  oauth.setCredentials({ refresh_token: user.refreshToken });

  // 2) Connect DB
  await connect();
  try {
    // 3) Kør alle 3 sync-flows i parallel
    const [campaigns, ads, keywords] = await Promise.all([
      syncCampaignDefsFromSheet(oauth, sheetId, user._id.toString()),
      syncAdDefsFromSheet      (oauth, sheetId, user._id.toString()),
      syncKeywordDefsFromSheet (oauth, sheetId, user._id.toString())
    ]);

    // 4) Send svar
    res.json({
      status:            'OK',
      campaignsSynced:   campaigns.length,
      adsSynced:         ads.length,
      keywordsSynced:    keywords.length
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  } finally {
    await disconnect();
  }
};