// src/controllers/adDefsController.ts
import { RequestHandler } from 'express';
import { connect, disconnect } from '../repository/database';
import { AdDefModel } from '../models/AdDefModel';
import { AuthenticatedRequest } from '../interfaces/userReq';
import { syncAdDefsFromSheet, deleteAdRowInSheet, updateAdRowInSheet } from '../services/adDefsService';
import { createOAuthClient } from '../services/googleAuthService';
import { IAdDef } from '../interfaces/iAdDef';


// src/controllers/adDefsController.ts

/** GET /api/ad-defs/:sheetId */
export const getAdsForSheet: RequestHandler = async (req, res) => {
  const user = (req as AuthenticatedRequest).user!;
  const { sheetId } = req.params;
  await connect();
  try {
    const docs = await AdDefModel.find({ sheetId, userId: user._id }).lean<IAdDef>().exec();
    res.json(docs);
  } catch (e:any) {
    res.status(500).json({ error: e.message });
  } finally {
    await disconnect();
  }
};

/** PUT /api/ad-defs/:sheetId/:adId */
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
    if (!doc) {
      res.status(404).json({ error:'Annonce ikke fundet' });
      return;
    }
    // opdater sheet
    try {
      const oauth = createOAuthClient();
      oauth.setCredentials({ refresh_token: user.refreshToken });
      await updateAdRowInSheet(oauth, sheetId, adId, updates);
    } catch { /* swallow */ }
    res.json(doc);
  } catch(e:any) {
    res.status(500).json({ error: e.message });
  } finally {
    await disconnect();
  }
};

/** DELETE /api/ad-defs/:sheetId/:adId */
export const deleteAd: RequestHandler = async (req, res) => {
    const user = (req as AuthenticatedRequest).user;
    const { sheetId, adId } = req.params;
  
    // 1) Auth
    if (!user?.refreshToken) {
      res.status(401).json({ error: 'Login kræves' });
      return;
    }
  
    // 2) Hent dokument og rowIndex
    await connect();
    try {
      const ad = await AdDefModel
        .findOne({ _id: adId, sheetId, userId: user._id })
        .lean();
  
      if (!ad) {
        res.status(404).json({ error: 'Annonce ikke fundet' });
        return;
      }
      if (ad.rowIndex == null) {
        res.status(500).json({ error: 'Kan ikke finde række-index for annoncen' });
        return;
      }
  
      // 3) Slet række i Google Sheets
      try {
        const oauth = createOAuthClient();
        oauth.setCredentials({ refresh_token: user.refreshToken });
        await deleteAdRowInSheet(oauth, sheetId, ad.rowIndex);
      } catch (err: any) {
        console.warn('Kunne ikke slette annonce-række i Sheet:', err.message);
        // fortsætter alligevel
      }
  
      // 4) Slet i MongoDB
      await AdDefModel.deleteOne({ _id: adId, sheetId, userId: user._id });
  
      // 5) Returnér succes
      res.json({ message: 'Annonce slettet' });
      return;
  
    } catch (err: any) {
      res.status(500).json({ error: err.message });
      return;
    } finally {
      // 6) Luk DB-forbindelse uanset hvad
      await disconnect();
    }
  };
  
/** POST /api/ad-defs/:sheetId/sync-db */
export const syncAds: RequestHandler = async (req, res) => {
  const user = (req as AuthenticatedRequest).user!;
  const { sheetId } = req.params;
  const oauth = createOAuthClient();
  oauth.setCredentials({ refresh_token: user.refreshToken });

  try {
    const parsed = await syncAdDefsFromSheet(oauth, sheetId, user._id.toString());
    res.json({ synced: parsed.length });
  } catch(e:any) {
    res.status(500).json({ error: e.message });
  }
};
