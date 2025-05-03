import express from 'express';
import { requireAuth } from '../middleware/requireAuth';
//import { syncSheetHandler } from '../controllers/syncSheetController';
import * as ctrl from '../controllers/sheetsController';







const sheetsRouter = express.Router();

// ─── CRUD for Sheets ────────────────────────────────────────────────────────

// Kun loggede brugere må kalde disse endpoints
sheetsRouter.use(requireAuth);

// Opret et nyt sheet
// POST /api/sheets
sheetsRouter.post('/', ctrl.createSheet);

// Hent alle sheets for den loggede bruger
// GET /api/sheets
sheetsRouter.get('/', ctrl.getSheets);

// Hent ét sheet
// GET /api/sheets/:sheetId
sheetsRouter.get('/:sheetId', ctrl.getSheetById);

// Opdater metadata for ét sheet (fx navn)
// PUT /api/sheets/:sheetId
sheetsRouter.put('/:sheetId', ctrl.updateSheet);

// Slet ét sheet + tilknyttede campaign-definitions
// DELETE /api/sheets/:sheetId
sheetsRouter.delete('/:sheetId', ctrl.deleteSheet);

// Kør sync mod Google Ads for ét sheet
// POST /api/sheets/:sheetId/sync
//sheetsRouter.post('/:sheetId/sync', ctrl.syncSheet);

// ─── CRUD for Sheets ────────────────────────────────────────────────────────

// Kampagner


// Annoncer


// Sync Ads
//sheetsRouter.post('/sync-sheet/:userId', requireAuth, syncSheetHandler);

//sheetsRouter.post('/', requireAuth, saveSheetMeta); // POST /api/sheets

//sheetsRouter.get('/sheet-link', requireAuth, getSheetLink);

export default sheetsRouter;
