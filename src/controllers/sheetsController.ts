import { RequestHandler } from 'express';
import { Types } from 'mongoose';
import { connect, disconnect } from '../repository/database';
import { SheetModel } from '../models/SheetModel';
import { createUserSheet, updateGoogleSheetTitle } from '../services/googleSheetsService';
import { createOAuthClient } from '../services/googleAuthService';
//import { syncSheetToAds } from '../services/syncSheetToAds';
import { AuthenticatedRequest } from '../interfaces/userReq';
import { google } from 'googleapis';

/**
 * POST /api/sheets
 */
export const createSheet: RequestHandler = async (req, res) => {
  const user = (req as AuthenticatedRequest).user!;
  const name = req.body.name as string;

  if (!name) {
    res.status(400).json({ error: 'Navn på sheet mangler' });
    return;
  }

  await connect();
  try {
    // 1) For‐check om sheet med samme navn allerede findes
    const exists = await SheetModel.findOne({ userId: user._id, name });
    if (exists) {
      res.status(409).json({ error: 'Du har allerede et sheet med dette navn' });
      return;
    }

    // 2) Opret sheet i Google
    const oauth = createOAuthClient();
    oauth.setCredentials({ refresh_token: user.refreshToken });
    const sheetId = await createUserSheet(oauth, name);
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}`;

    // 3) Gem metadata i MongoDB
    const sheet = await SheetModel.create({
      userId: new Types.ObjectId(user._id),
      sheetId,
      name,
      sheetUrl
    });

    res.status(201).json(sheet);
    return;
  } catch (err: any) {
    // Fange duplicate‐key hvis for‐check blev sprunget over
    if (err.code === 11000) {
      res.status(409).json({ error: 'Sheet-navn allerede i brug' });
    } else {
      res.status(500).json({ error: err.message });
    }
  } finally {
    await disconnect();
  }
};

/**
 * GET /api/sheets
 */
export const getSheets: RequestHandler = async (req, res) => {
  const user = (req as AuthenticatedRequest).user;
  if (!user) {
    res.status(401).json({ error: 'Login kræves' });
    return;
  }

  await connect();
  try {
    const docs = await SheetModel.find({ userId: user._id }).lean().exec();
    res.json(docs);
    return;
  } catch (err: any) {
    res.status(500).json({ error: err.message });
    return;
  } finally {
    await disconnect();
  }
};

/**
 * GET /api/sheets/:sheetId
 */
export const getSheetById: RequestHandler = async (req, res) => {
  const user = (req as AuthenticatedRequest).user;
  const { sheetId } = req.params;

  if (!user) {
    res.status(401).json({ error: 'Login kræves' });
    return;
  }

  await connect();
  try {
    const doc = await SheetModel.findOne({ _id: sheetId, userId: user._id })
      .lean()
      .exec();
    if (!doc) {
      res.status(404).json({ error: 'Sheet ikke fundet' });
      return;
    }
    res.json(doc);
    return;
  } catch (err: any) {
    res.status(500).json({ error: err.message });
    return;
  } finally {
    await disconnect();
  }
};

/**
 * PUT /api/sheets/:sheetId
 */
export const updateSheet: RequestHandler = async (req, res): Promise<void> => {
  const user = (req as AuthenticatedRequest).user;
  const mongoId = req.params.sheetId;          // dette er MongoDB’s _id
  const { name: newName } = req.body;          // Vi ændrer kun ’name’

  if (!user || !user.refreshToken) {
    res.status(401).json({ error: 'Login kræves' });
    return;
  }
  if (!newName) {
    res.status(400).json({ error: 'Nyt navn mangler' });
    return;
  }

  // 1) Find Sheet-doc i DB
  await connect();
  let sheetDoc;
  try {
    sheetDoc = await SheetModel.findOne({ _id: mongoId, userId: user._id });
    if (!sheetDoc) {
      res.status(404).json({ error: 'Sheet ikke fundet i DB' });
      return;
    }
  } catch (err: any) {
    await disconnect();
    res.status(500).json({ error: 'DB‐opslag mislykkedes: ' + err.message });
    return;
  }

  const fileId = sheetDoc.sheetId;  // det korrekte Google‐ID

  // 2) Prøv at rename filen i Drive
  try {
    const oauth2 = createOAuthClient();
    oauth2.setCredentials({ refresh_token: user.refreshToken });
    const drive = google.drive({ version: 'v3', auth: oauth2 });
    await drive.files.update({
      fileId,
    supportsAllDrives: true,        // nødvendigt
    requestBody: { name: newName }
    });
  } catch (err: any) {
    console.warn('Kunne ikke ændre navn i Drive (fortsætter med DB):', err.message);
  }

  // 3) Opdater ’name’ i MongoDB
  try {
    const updated = await SheetModel.findByIdAndUpdate(
      mongoId,
      { name: newName },
      { new: true, lean: true }
    );
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'DB-opdatering mislykkedes: ' + err.message });
  } finally {
    await disconnect();
  }
};


/**
 * DELETE /api/sheets/:sheetId
 */
export const deleteSheet: RequestHandler = async (req, res): Promise<void> => {
  const user = (req as AuthenticatedRequest).user;
  const mongoId = req.params.sheetId;  // MongoDB‐ID, ikke selve Google‐ID

  if (!user || !user.refreshToken) {
    res.status(401).json({ error: 'Login kræves' });
    return;
  }

  // 1) Hent Sheet-doc for at få Google-ID
  await connect();
  let sheetDoc;
  try {
    sheetDoc = await SheetModel.findOne({ _id: mongoId, userId: user._id });
    if (!sheetDoc) {
      res.status(404).json({ error: 'Sheet ikke fundet i DB' });
      return;
    }
  } catch (err: any) {
    await disconnect();
    res.status(500).json({ error: 'DB-opslag mislykkedes: ' + err.message });
    return;
  }

  const fileId = sheetDoc.sheetId;

  // 2) Slet selve dokumentet i Google Drive
  try {
    const oauth2 = createOAuthClient();
    oauth2.setCredentials({ refresh_token: user.refreshToken });
    const drive = google.drive({ version: 'v3', auth: oauth2 });
    await drive.files.delete({ fileId });
  } catch (err: any) {
    console.warn('Kunne ikke slette i Drive (fortsætter med DB):', err.message);
  }

  // 3) Kaskade‐delete i DB
  try {
    await SheetModel.deleteOne({ _id: mongoId });
    await import('../models/CampaignDefModel')
      .then(m => m.CampaignDefModel.deleteMany({ sheetId: fileId, userId: user._id }));
    res.json({ message: 'Sheet slettet i både Drive og DB' });
  } catch (err: any) {
    res.status(500).json({ error: 'DB-sletning mislykkedes: ' + err.message });
  } finally {
    await disconnect();
  }
};

// // controllers/sheetsController.ts
// export const syncSheet: RequestHandler = async (req, res) => {
//   const oauth = createOAuthClient();
//   oauth.setCredentials({ refresh_token: req.user!.refreshToken });
//   try {
//     await syncSheetToAds(oauth, req.params.sheetId);
//     res.json({ status:'OK' });
//   } catch (err:any) {
//     res.status(500).json({ error: err.message });
//   }
// };

 /**
 * POST /api/sheets/:sheetId/sync
 */
/*export const syncSheet: RequestHandler = async (req, res) => {
  const user = (req as AuthenticatedRequest).user;
  const { sheetId } = req.params;

  if (!user || !user.refreshToken) {
    res.status(401).json({ error: 'Login kræves' });
    return;
  }

  await connect();
  try {
    const oauth = createOAuthClient();
    oauth.setCredentials({ refresh_token: user.refreshToken });
    const statuses = await syncSheetToAds(oauth, user._id.toString());
    res.json({ status: 'OK', result: statuses });
    return;
  } catch (err: any) {
    console.error('syncSheet fejlede:', err);
    res.status(500).json({ error: err.message });
    return;
  } finally {
    await disconnect();
  }
}; */


// // src/controllers/sheetsController.ts
// import { RequestHandler } from 'express';
// import { connect, disconnect } from '../repository/database';
// import { SheetModel } from '../models/SheetModel';
// import { createUserSheet } from '../services/googleSheetsService';
// import { syncCampaignDefsFromSheet } from '../services/campaignDefsService';
// import { createOAuthClient } from '../services/googleAuthService';
// import { AuthenticatedRequest } from '../interfaces/userReq';

// /**
//  * POST /api/sheets
//  */
// export const createSheet: RequestHandler = async (req, res) => {
//   const user = (req as AuthenticatedRequest).user!;
//   const { name } = req.body;
//   if (!name) {
//     res.status(400).json({ error: 'Navn på sheet mangler' });
//     return;
//   }

//   await connect();
//   try {
//     const client = createOAuthClient();
//     client.setCredentials({ refresh_token: user.refreshToken });
//     const sheetId  = await createUserSheet(client, name);
//     const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}`;

//     const sheet = await SheetModel.create({
//       userId: user._id,
//       sheetId,
//       name,
//       sheetUrl
//     });

//     res.status(201).json(sheet);
//   } catch (err: any) {
//     res.status(500).json({ error: err.message });
//   } finally {
//     await disconnect();
//   }
// };

// /**
//  * GET /api/sheets
//  */
// export const getSheets: RequestHandler = async (req, res) => {
//   const user = (req as AuthenticatedRequest).user!;

//   await connect();
//   try {
//     const sheets = await SheetModel.find({ userId: user._id }).lean();
//     res.json(sheets);
//   } catch (err: any) {
//     res.status(500).json({ error: err.message });
//   } finally {
//     await disconnect();
//   }
// };

// /**
//  * GET /api/sheets/:sheetId
//  */
// export const getSheetById: RequestHandler = async (req, res) => {
//   const user = (req as AuthenticatedRequest).user!;
//   const { sheetId } = req.params;

//   await connect();
//   try {
//     const sheet = await SheetModel
//       .findOne({ _id: sheetId, userId: user._id })
//       .lean();
//     if (!sheet) {
//       res.status(404).json({ error: 'Sheet ikke fundet' });
//       return;
//     }
//     res.json(sheet);
//   } catch (err: any) {
//     res.status(500).json({ error: err.message });
//   } finally {
//     await disconnect();
//   }
// };

// /**
//  * PUT /api/sheets/:sheetId
//  */
// export const updateSheet: RequestHandler = async (req, res) => {
//   const user = (req as AuthenticatedRequest).user!;
//   const { sheetId } = req.params;

//   await connect();
//   try {
//     const sheet = await SheetModel.findOneAndUpdate(
//       { _id: sheetId, userId: user._id },
//       req.body,
//       { new: true, lean: true }
//     );
//     if (!sheet) {
//       res.status(404).json({ error: 'Sheet ikke fundet' });
//       return;
//     }
//     res.json(sheet);
//   } catch (err: any) {
//     res.status(500).json({ error: err.message });
//   } finally {
//     await disconnect();
//   }
// };

// /**
//  * DELETE /api/sheets/:sheetId
//  */
// export const deleteSheet: RequestHandler = async (req, res) => {
//   const user = (req as AuthenticatedRequest).user!;
//   const { sheetId } = req.params;

//   await connect();
//   try {
//     const sheet = await SheetModel.findOneAndDelete({ _id: sheetId, userId: user._id });
//     if (!sheet) {
//       res.status(404).json({ error: 'Sheet ikke fundet' });
//       return;
//     }
//     // Kaskade-slet tilhørende kampagner
//     await import('../models/CampaignDefModel')
//       .then(m => m.CampaignDefModel.deleteMany({ sheetId, userId: user._id }));
//     res.json({ message: 'Sheet + kampagner slettet' });
//   } catch (err: any) {
//     res.status(500).json({ error: err.message });
//   } finally {
//     await disconnect();
//   }
// };

// /**
//  * POST /api/sheets/:sheetId/sync
//  */
// export const syncSheet: RequestHandler = async (req, res) => {
//   const user = (req as AuthenticatedRequest).user!;
//   const { sheetId } = req.params;

//   await connect();
//   try {
//     const client = createOAuthClient();
//     client.setCredentials({ refresh_token: user.refreshToken });
//     const names = await syncCampaignDefsFromSheet(client, sheetId, user._id.toString());
//     await SheetModel.findByIdAndUpdate(sheetId, { lastSynced: new Date() });
//     res.json({ status: 'OK', synced: names.length });
//   } catch (err: any) {
//     res.status(500).json({ error: err.message });
//   } finally {
//     await disconnect();
//   }
// };


// /* import { RequestHandler } from 'express';
// import { connect, disconnect } from '../repository/database';
// import { createOAuthClient }    from '../services/googleAuthService';
// import { createUserSheet }      from '../services/googleSheetsService';
// import { syncSheetToDb }        from '../services/syncService';
// import { SheetModel }           from '../models/SheetModel';
// import { AuthenticatedRequest } from '../interfaces/userReq';

// // POST /api/sheets
// export const createSheet: RequestHandler = async (req, res): Promise<void> => {
//   const user = (req as AuthenticatedRequest).user!;
//   const { name } = req.body;
//   if (!user.refreshToken || !name) {
//     res.status(400).json({ error: 'Mangler bruger eller navn' }); return;
//   }

//   await connect();
//   try {
//     const oAuth = createOAuthClient();
//     oAuth.setCredentials({ refresh_token: user.refreshToken });
//     const sheetId = await createUserSheet(oAuth, name);
//     const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}`;

//     const sheet = await SheetModel.create({ user: user._id, sheetId, name, sheetUrl });
//     res.status(201).json(sheet);
//   } catch (e: any) {
//     res.status(500).json({ error: e.message });
//   } finally {
//     await disconnect();
//   }
// };

// // GET /api/sheets
// export const getSheets: RequestHandler = async (req, res): Promise<void> => {
//   const user = (req as AuthenticatedRequest).user!;
//   await connect();
//   try {
//     const list = await SheetModel.find({ user: user._id }).lean();
//     res.json(list);
//   } catch (e: any) {
//     res.status(500).json({ error: e.message });
//   } finally {
//     await disconnect();
//   }
// };

// // GET /api/sheets/:sheetId
// export const getSheetById: RequestHandler = async (req, res): Promise<void> => {
//   const user = (req as AuthenticatedRequest).user!;
//   const { sheetId } = req.params;
//   await connect();
//   try {
//     const sheet = await SheetModel.findOne({ sheetId, user: user._id }).lean();
//     if (!sheet) { res.status(404).json({ error: 'Ikke fundet' }); return; }
//     res.json(sheet);
//   } catch (e: any) {
//     res.status(500).json({ error: e.message });
//   } finally {
//     await disconnect();
//   }
// };

// // PUT /api/sheets/:sheetId
// export const updateSheet: RequestHandler = async (req, res): Promise<void> => {
//   const user = (req as AuthenticatedRequest).user!;
//   const { sheetId } = req.params;
//   const updates = req.body;
//   await connect();
//   try {
//     const sheet = await SheetModel.findOneAndUpdate(
//       { sheetId, user: user._id },
//       updates,
//       { new: true }
//     ).lean();
//     if (!sheet) { res.status(404).json({ error: 'Ikke fundet' }); return; }
//     res.json(sheet);
//   } catch (e: any) {
//     res.status(500).json({ error: e.message });
//   } finally {
//     await disconnect();
//   }
// };

// // DELETE /api/sheets/:sheetId
// export const deleteSheet: RequestHandler = async (req, res): Promise<void> => {
//   const user = (req as AuthenticatedRequest).user!;
//   const { sheetId } = req.params;
//   await connect();
//   try {
//     const sheet = await SheetModel.findOneAndDelete({ sheetId, user: user._id });
//     if (!sheet) { res.status(404).json({ error: 'Ikke fundet' }); return; }
//     // evt. slet Google‑arket med sheets API
//     res.json({ message: 'Slettet' });
//   } catch (e: any) {
//     res.status(500).json({ error: e.message });
//   } finally {
//     await disconnect();
//   }
// };

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