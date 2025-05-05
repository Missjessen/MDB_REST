import { RequestHandler, NextFunction, Response } from 'express';
import { Types } from 'mongoose';
import { connect, disconnect } from '../repository/database';
import { SheetModel } from '../models/SheetModel';
import { createUserSheet, updateGoogleSheetTitle } from '../services/googleSheetsService';
import { createOAuthClient } from '../services/googleAuthService';
//import { syncSheetToAds } from '../services/syncSheetToAds';
import { AuthenticatedRequest } from '../interfaces/userReq';
import { google } from 'googleapis';
//import { syncAllFromSheet } from '../services/sheetService';

// ░▒▓██ get, post, put, delete (CRUD)██▓▒░
/**
 * POST /api/sheets
 */
export const createSheet = async (
  req: AuthenticatedRequest,
  res: Response, // Ensure Response type is explicitly defined
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    const name = req.body.name as string;
    if (!name) {
      res.status(400).json({ error: 'Navn på sheet mangler' });
      return;
    }
    const exists = await SheetModel.findOne({ userId: user._id, name });
    if (exists) {
      res.status(409).json({ error: 'Du har allerede et sheet med dette navn' });
      return;
    }
    const oauth = createOAuthClient();
    oauth.setCredentials({ refresh_token: user.refreshToken });
    const sheetId = await createUserSheet(oauth, name);
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}`;
    const sheet = await SheetModel.create({
      userId: new Types.ObjectId(user._id),
      sheetId,
      name,
      sheetUrl
    });
    res.status(201).json(sheet);
  } catch (err: any) {
    if (err.code === 11000) {
      res.status(409).json({ error: 'Sheet-navn allerede i brug' });
    } else {
      next(err);
    }
  }
};
// export const createSheet: RequestHandler = async (req, res) => {
//   const user = (req as AuthenticatedRequest).user!;
//   const name = req.body.name as string;

//   if (!name) {
//     res.status(400).json({ error: 'Navn på sheet mangler' });
//     return;
//   }

//   //await connect();
//   try {
//     // 1) For‐check om sheet med samme navn allerede findes
//     const exists = await SheetModel.findOne({ userId: user._id, name });
//     if (exists) {
//       res.status(409).json({ error: 'Du har allerede et sheet med dette navn' });
//       return;
//     }

//     // 2) Opret sheet i Google
//     const oauth = createOAuthClient();
//     oauth.setCredentials({ refresh_token: user.refreshToken });
//     const sheetId = await createUserSheet(oauth, name);
//     const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}`;

//     // 3) Gem metadata i MongoDB
//     const sheet = await SheetModel.create({
//       userId: new Types.ObjectId(user._id),
//       sheetId,
//       name,
//       sheetUrl
//     });

//     res.status(201).json(sheet);
//     return;
//   } catch (err: any) {
//     // Fange duplicate‐key hvis for‐check blev sprunget over
//     if (err.code === 11000) {
//       res.status(409).json({ error: 'Sheet-navn allerede i brug' });
//     } else {
//       res.status(500).json({ error: err.message });
//     }
//   } //finally {
//     //await disconnect();
//   //}
// };

/**
 * GET /api/sheets
 */
export const getSheets = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    const docs = await SheetModel.find({ userId: user._id }).lean().exec();
    res.json(docs);
  } catch (err) {
    next(err);
  }
};
// export const getSheets: RequestHandler = async (req, res) => {
//   const user = (req as AuthenticatedRequest).user;
//   if (!user) {
//     res.status(401).json({ error: 'Login kræves' });
//     return;
//   }

//   //await connect();
//   try {
//     const docs = await SheetModel.find({ userId: user._id }).lean().exec();
//     res.json(docs);
//     return;
//   } catch (err: any) {
//     res.status(500).json({ error: err.message });
//     return;
//   } 
  
// };

/**
 * GET /api/sheets/:sheetId
 */
export const getSheetById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    const id = req.params.id;
    const doc = await SheetModel.findOne({ _id: id, userId: user._id }).lean().exec();
    if (!doc) {
      res.status(404).json({ error: 'Sheet ikke fundet' });
      return;
    }
    res.json(doc);
  } catch (err) {
    next(err);
  }
};
// export const getSheetById: RequestHandler = async (req, res) => {
//   const user = (req as AuthenticatedRequest).user;
//   const { sheetId } = req.params;

//   if (!user) {
//     res.status(401).json({ error: 'Login kræves' });
//     return;
//   }

//   //await connect();
//   try {
//     const doc = await SheetModel.findOne({ _id: sheetId, userId: user._id })
//       .lean()
//       .exec();
//     if (!doc) {
//       res.status(404).json({ error: 'Sheet ikke fundet' });
//       return;
//     }
//     res.json(doc);
//     return;
//   } catch (err: any) {
//     res.status(500).json({ error: err.message });
//     return;
//   } //finally {
//     //await disconnect();
//   //}
// };

/**
 * PUT /api/sheets/:sheetId
 */
export const updateSheetById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    const id = req.params.id;
    const newName = req.body.name as string;
    if (!newName) {
      res.status(400).json({ error: 'Nyt navn mangler' });
      return;
    }
    const updated = await SheetModel.findOneAndUpdate(
      { _id: id, userId: user._id },
      { name: newName },
      { new: true, lean: true }
    );
    if (!updated) {
      res.status(404).json({ error: 'Sheet ikke fundet' });
      return;
    }
    // Optional: rename in Google Drive
    try {
      const oauth2 = createOAuthClient();
      oauth2.setCredentials({ refresh_token: user.refreshToken });
      await google.drive({ version: 'v3', auth: oauth2 }).files.update({
        fileId: updated.sheetId,
        supportsAllDrives: true,
        requestBody: { name: newName }
      });
    } catch (driveErr: any) {
      console.warn('Drive rename fejlede:', driveErr.message);
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
};
// export const updateSheet: RequestHandler = async (req, res): Promise<void> => {
//   const user = (req as AuthenticatedRequest).user;
//   const mongoId = req.params.sheetId;          // dette er MongoDB’s _id
//   const { name: newName } = req.body;          // Vi ændrer kun ’name’

//   if (!user || !user.refreshToken) {
//     res.status(401).json({ error: 'Login kræves' });
//     return;
//   }
//   if (!newName) {
//     res.status(400).json({ error: 'Nyt navn mangler' });
//     return;
//   }

//   // 1) Find Sheet-doc i DB
//   //await connect();
//   let sheetDoc;
//   try {
//     sheetDoc = await SheetModel.findOne({ _id: mongoId, userId: user._id });
//     if (!sheetDoc) {
//       res.status(404).json({ error: 'Sheet ikke fundet i DB' });
//       return;
//     }
//   } catch (err: any) {
//     await disconnect();
//     res.status(500).json({ error: 'DB‐opslag mislykkedes: ' + err.message });
//     return;
//   }

//   const fileId = sheetDoc.sheetId;  // det korrekte Google‐ID

//   // 2) Prøv at rename filen i Drive
//   try {
//     const oauth2 = createOAuthClient();
//     oauth2.setCredentials({ refresh_token: user.refreshToken });
//     const drive = google.drive({ version: 'v3', auth: oauth2 });
//     await drive.files.update({
//       fileId,
//     supportsAllDrives: true,        // nødvendigt
//     requestBody: { name: newName }
//     });
//   } catch (err: any) {
//     console.warn('Kunne ikke ændre navn i Drive (fortsætter med DB):', err.message);
//   }

//   // 3) Opdater ’name’ i MongoDB
//   try {
//     const updated = await SheetModel.findByIdAndUpdate(
//       mongoId,
//       { name: newName },
//       { new: true, lean: true }
//     );
//     res.json(updated);
//   } catch (err: any) {
//     res.status(500).json({ error: 'DB-opdatering mislykkedes: ' + err.message });
//   } //finally {
//     //await disconnect();
//   //}
// };


/**
 * DELETE /api/sheets/:sheetId
 */
export const deleteSheetById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    const id = req.params.id;
    const doc = await SheetModel.findOne({ _id: id, userId: user._id });
    if (!doc) {
      res.status(404).json({ error: 'Sheet ikke fundet' });
      return;
    }
    // Optional: delete from Google Drive
    try {
      const oauth2 = createOAuthClient();
      oauth2.setCredentials({ refresh_token: user.refreshToken });
      await google.drive({ version: 'v3', auth: oauth2 }).files.delete({ fileId: doc.sheetId });
    } catch (driveErr: any) {
      console.warn('Drive delete fejlede:', driveErr.message);
    }
    await SheetModel.deleteOne({ _id: id });
    res.json({ message: 'Sheet slettet' });
  } catch (err) {
    next(err);
  }
};

// export const deleteSheet: RequestHandler = async (req, res): Promise<void> => {
//   const user = (req as AuthenticatedRequest).user;
//   const mongoId = req.params.sheetId;  // MongoDB‐ID, ikke selve Google‐ID

//   if (!user || !user.refreshToken) {
//     res.status(401).json({ error: 'Login kræves' });
//     return;
//   }

//   // 1) Hent Sheet-doc for at få Google-ID
//   //await connect();
//   let sheetDoc;
//   try {
//     sheetDoc = await SheetModel.findOne({ _id: mongoId, userId: user._id });
//     if (!sheetDoc) {
//       res.status(404).json({ error: 'Sheet ikke fundet i DB' });
//       return;
//     }
//   } catch (err: any) {
//     //await disconnect();
//     res.status(500).json({ error: 'DB-opslag mislykkedes: ' + err.message });
//     return;
//   }

//   const fileId = sheetDoc.sheetId;

//   // 2) Slet selve dokumentet i Google Drive
//   try {
//     const oauth2 = createOAuthClient();
//     oauth2.setCredentials({ refresh_token: user.refreshToken });
//     const drive = google.drive({ version: 'v3', auth: oauth2 });
//     await drive.files.delete({ fileId });
//   } catch (err: any) {
//     console.warn('Kunne ikke slette i Drive (fortsætter med DB):', err.message);
//   }

//   // 3) Kaskade‐delete i DB
//   try {
//     await SheetModel.deleteOne({ _id: mongoId });
//     await import('../models/CampaignDefModel')
//       .then(m => m.CampaignDefModel.deleteMany({ sheetId: fileId, userId: user._id }));
//     res.json({ message: 'Sheet slettet i både Drive og DB' });
//   } catch (err: any) {
//     res.status(500).json({ error: 'DB-sletning mislykkedes: ' + err.message });
//   } //finally {
//     //await disconnect();
//   //}
// };


// export const syncAllSheets = 
//   async (
//     req: AuthenticatedRequest, 
//     res: Response, 
//     next: NextFunction
//   ): Promise<void> => {
//     try {
//       await connect();
//       const oAuthClient = await createOAuthClient(req.user);
//       const sheetId = req.params.sheetId;
//       const userId  = req.user.id;
//       const result  = await syncAllFromSheet(oAuthClient, sheetId, userId);
//       await disconnect();

//       // Kald res.json OG returnér derefter tomt:
//       res.status(200).json(result);
//       return;         // ← sikrer at funktionen slutter med void
//     } catch (err) {
//       await disconnect();
//       next(err);
//       return;         // ← også void
//     }
//   };



// // POST /api/sheets/:sheetId/sync
// export const syncSheet: RequestHandler = async (req, res): Promise<void> => {
//   const user = (req as AuthenticatedRequest).user!;
//   const { sheetId } = req.params;
//   await connect();
//   try {
//     const oAuth = createOAuthClient();
//     oAuth.setCredentials({ refresh_token: user.refreshToken });
//     const statuses = await syncSheetToDb(oAuth, user._id.toString(), sheetId);
//     res.json({ status: 'OK', result: statuses });
//   } catch (e: any) {
//     res.status(500).json({ error: e.message });
//   } finally {
//     await disconnect();
//   }
// };
//  */