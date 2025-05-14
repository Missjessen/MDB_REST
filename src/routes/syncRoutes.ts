// // src/routes/sheets.ts
// import { Router } from 'express';
// import { requireAuth } from '../middleware/requireAuth';
// import * as ctrl from  '../controllers/syncSheetController';

// const syncRouter = Router();
// syncRouter.use(requireAuth);
// /**
//  * @openapi
//  * /sheets/{sheetId}/sync-db:
//  *   post:
//  *     summary: Synkroniser alle ark til DB
//  *     tags: [Sheets]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: sheetId
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Objekt med antal synkroniserede kampagner, annoncer og keywords
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 campaigns:
//  *                   type: integer
//  *                 ads:
//  *                   type: integer
//  *                 keywords:
//  *                   type: integer
//  */
// syncRouter.post('/:sheetId/sync-db-all',      ctrl. syncDbController);

// /**
//  * @openapi
//  * /sheets/{sheetId}/sync-ads:
//  *   post:
//  *     summary: Synkroniser kun Ads (AllResources → Google Ads)
//  *     tags: [Sheets]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: sheetId
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Liste af status-strings
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 statuses:
//  *                   type: array
//  *                   items:
//  *                     type: string
//  */
// /**
// syncRouter.post('/:sheetId/sync-ads',         ctrl. syncAdsController);

// /**
//  * @openapi
//  * /sheets/{sheetId}/sync-all:
//  *   post:
//  *     summary: Synkroniser DB + Ads i én kald
//  *     tags: [Sheets]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: sheetId
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Samlet resultat
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 campaignsSynced:
//  *                   type: integer
//  *                 adsSynced:
//  *                   type: integer
//  *                 keywordsSynced:
//  *                   type: integer
//  *                 adsStatuses:
//  *                   type: array
//  *                   items:
//  *                     type: string
//  */
// syncRouter.post('/:sheetId/sync-all-and-ads', ctrl. syncAllAndAdsController);

// export default syncRouter;
