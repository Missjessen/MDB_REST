// src/routes/campaignDefsRoutes.ts
import express from 'express';
import { requireAuth } from '../middleware/requireAuth';
import * as ctrl from '../controllers/campaignDefsController';

const campaignDefsRoutes = express.Router();

// alle ruter er beskyttet
campaignDefsRoutes.use(requireAuth);

campaignDefsRoutes.get   ('/campaign-defs/:sheetId',             ctrl.getCampaignsForSheet);
campaignDefsRoutes.put   ('/campaign-defs/:sheetId/:campaignId', ctrl.updateCampaign);
campaignDefsRoutes.delete('/campaign-defs/:sheetId/:campaignId', ctrl.deleteCampaign);

export default campaignDefsRoutes;
