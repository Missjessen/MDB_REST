// src/routes/adRoutes.ts
import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth'
import * as ctrl       from '../controllers/adDefsController'

const adRouter = Router()

// Beskyt alle endpoints med JWT
adRouter.use(requireAuth)


adRouter.get('/:sheetId', ctrl.getAdsForSheet)
adRouter.put('/:sheetId/:adId', ctrl.updateAd);
adRouter.delete('/:sheetId/:adId', ctrl.deleteAd);
adRouter.post('/:sheetId/sync-db', ctrl.syncAds);

export default adRouter;