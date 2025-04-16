import express from 'express';
import { requireAuth } from '../middleware/requireAuth';
import {
  createAndSaveSheet,
  getSheetLink
} from '../controllers/sheetsIdController';

const sheetsRouter = express.Router();

sheetsRouter.post('/create-sheet', requireAuth, createAndSaveSheet);
//sheetsRouter.get('/sheet-link', requireAuth, getSheetLink);

export default sheetsRouter;
