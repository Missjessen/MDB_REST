// src/routes/keywordRoutes.ts
import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import * as ctrl from '../controllers/keywordDefsController';

const keywordsRouter = Router({ mergeParams: true });
keywordsRouter.use(requireAuth);

keywordsRouter.get('/:sheetId',          ctrl.getKeywordsForSheet);
keywordsRouter.put('/:sheetId/:keywordId', ctrl.updateKeyword);
keywordsRouter.delete('/:sheetId/:keywordId', ctrl.deleteKeyword);
keywordsRouter.post('/:sheetId/sync',     ctrl.syncKeywords);

export default keywordsRouter;
