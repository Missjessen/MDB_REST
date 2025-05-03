// src/routes/campaignDefsRoutes.ts
import express from 'express';
import { requireAuth } from '../middleware/requireAuth';
import * as ctrl from '../controllers/campaignDefsController';

const campaignRouter = express.Router();

// alle ruter er beskyttet
campaignRouter.use(requireAuth);

campaignRouter.get   ('/:sheetId',             ctrl.getCampaignsForSheet);
campaignRouter.put   ('/:sheetId/:campaignId', ctrl.updateCampaign);
campaignRouter.delete('/:sheetId/:campaignId', ctrl.deleteCampaign);
campaignRouter.post('/:sheetId/sync-db', ctrl.syncCampaignDefs);



export default campaignRouter;
