// src/routes/sheets.ts
import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import * as ctrl from  '../controllers/syncSheetController';

const syncRouter = Router();
syncRouter.use(requireAuth);

syncRouter.post('/:sheetId/sync-db-all',      ctrl. syncDbController);
syncRouter.post('/:sheetId/sync-ads',         ctrl. syncAdsController);
syncRouter.post('/:sheetId/sync-all-and-ads', ctrl. syncAllAndAdsController);

export default syncRouter;
