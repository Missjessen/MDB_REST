/* // src/routes/deployRoutes.ts
import express from 'express';
import { requireAuth }     from '../middleware/requireAuth';
import { enqueueDeploy }   from '../controllers/deployController';

const deployRoutes = express.Router();
deployRoutes.post('/deploy/:sheetId/:campaignId', requireAuth, enqueueDeploy);
export default deployRoutes;
 */