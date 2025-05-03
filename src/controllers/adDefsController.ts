// src/controllers/adDefsController.ts
import { RequestHandler } from 'express';
import { connect, disconnect } from '../repository/database';
import { AdDefModel } from '../models/AdDefModel';
import { AuthenticatedRequest } from '../interfaces/userReq';
import { syncAdDefsFromSheet } from '../services/adDefsService';
import { createOAuthClient } from '../services/googleAuthService';

// GET /api/ad-defs/:sheetId
export const getAdsForSheet: RequestHandler = async (req, res) => {
    const user = (req as AuthenticatedRequest).user!;
    const { sheetId } = req.params;
    await connect();
    try {
      const docs = await AdDefModel.find({ sheetId, userId: user._id }).lean().exec();
      res.json(docs);
    } catch (err:any) {
      res.status(500).json({ error: err.message });
    } finally {
      await disconnect();
    }
  };
  
  // PUT /api/ad-defs/:sheetId/:adId
  export const updateAd: RequestHandler = async (req, res) => {
    const user = (req as AuthenticatedRequest).user!;
    const { sheetId, adId } = req.params;
    const updates = req.body;
    await connect();
    try {
      const doc = await AdDefModel.findOneAndUpdate(
        { _id: adId, sheetId, userId: user._id },
        updates,
        { new:true, lean:true }
      );
      if (!doc) res.status(404).json({ error:'Annonce ikke fundet' });
      res.json(doc);
    } catch (err:any) {
      res.status(500).json({ error: err.message });
    } finally {
      await disconnect();
    }
  };
  
  // DELETE /api/ad-defs/:sheetId/:adId
  export const deleteAd: RequestHandler = async (req, res) => {
    const user = (req as AuthenticatedRequest).user!;
    const { sheetId, adId } = req.params;
    await connect();
    try {
      const doc = await AdDefModel.findOneAndDelete({ _id: adId, sheetId, userId: user._id });
      if (!doc) res.status(404).json({ error:'Annonce ikke fundet' });
      res.json({ message:'Annonce slettet' });
    } catch (err:any) {
      res.status(500).json({ error: err.message });
    } finally {
      await disconnect();
    }
  };
  
  // POST /api/ad-defs/:sheetId/sync
  export const syncAds: RequestHandler = async (req, res) => {
    const user = (req as AuthenticatedRequest).user!;
    const { sheetId } = req.params;
    const oauth = createOAuthClient();
    oauth.setCredentials({ refresh_token: user.refreshToken });
    try {
      const parsed = await syncAdDefsFromSheet(oauth, sheetId, user._id.toString());
      res.json({ status:'OK', updated: parsed.length });
    } catch (err:any) {
      res.status(500).json({ error: err.message });
    }
  };


