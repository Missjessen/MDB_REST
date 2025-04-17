import express from 'express';
import { requireAuth } from '../middleware/requireAuth';
import {
  createAndSaveSheet,
  getSheetLink
} from '../controllers/sheetsIdController';
import { syncSheetHandler } from '../controllers/syncSheetController';



const sheetsRouter = express.Router();

sheetsRouter.post('/create-sheet', requireAuth, createAndSaveSheet);
sheetsRouter.post('/sync-sheet/:userId', requireAuth, syncSheetHandler);

//sheetsRouter.post('/', requireAuth, saveSheetMeta); // POST /api/sheets

//sheetsRouter.get('/sheet-link', requireAuth, getSheetLink);

export default sheetsRouter;
