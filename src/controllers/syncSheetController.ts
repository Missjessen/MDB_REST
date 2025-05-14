// src/controllers/sheetsController.ts
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../interfaces/userReq';
import { createOAuthClient } from '../services/googleAuthService';
import { syncAllFromSheet } from '../services/syncSheetToAds';
import { syncSheetToAds }   from '../services/syncSheetToAds';



export const syncDbController = 
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    // 1) Tjek authentication
    if (!req.user?.refreshToken) {
      res.status(401).json({ error: 'Login kræves' });
      return;
    }

    const { sheetId } = req.params;
    const oauth       = createOAuthClient();
    oauth.setCredentials({ refresh_token: req.user.refreshToken });

    try {
      //await connect();
      const result = await syncAllFromSheet(oauth, sheetId, req.user._id.toString());
      res.status(200).json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    } 
};

export const syncAdsController = 
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user?.refreshToken) {
      res.status(401).json({ error: 'Login kræves' });
      return;
    }

    const { sheetId } = req.params;
    const oauth       = createOAuthClient();
    oauth.setCredentials({ refresh_token: req.user.refreshToken });

    try {
      //await connect();
      const statuses = await syncSheetToAds(oauth, sheetId, req.user._id.toString());
      res.status(200).json({ statuses });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    } 
};

export const syncAllAndAdsController = 
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user?.refreshToken) {
      res.status(401).json({ error: 'Login kræves' });
      return;
    }

    const { sheetId } = req.params;
    const oauth       = createOAuthClient();
    oauth.setCredentials({ refresh_token: req.user.refreshToken });

    try {
      //await connect();
      const dbResult    = await syncAllFromSheet(oauth, sheetId, req.user._id.toString());
      const adsStatuses = await syncSheetToAds(oauth, sheetId, req.user._id.toString());
      res.status(200).json({
        campaignsSynced: dbResult.campaigns,
        adsSynced:      dbResult.ads,
        keywordsSynced: dbResult.keywords,
        adsStatuses,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    } 
};