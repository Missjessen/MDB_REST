// src/routes/campaignDefsRoutes.ts
import express from 'express';
import { requireAuth } from '../middleware/requireAuth';
import * as ctrl from '../controllers/campaignDefsController';

const campaignRouter = express.Router();

// alle ruter er beskyttet
campaignRouter.use(requireAuth);
/**
 * @openapi
 * /campaign-defs/{sheetId}:
 *   get:
 *     summary: Hent alle kampagnedefinitioner for et specifikt sheet
 *     tags:
 *       - CampaignDefs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sheetId
 *         required: true
 *         description: Google Sheet ID
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: En liste af kampagnedefinitioner
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CampaignDef'
 *       '401':
 *         description: Unauthorized (mangler eller ugyldigt token)
 */
campaignRouter.get   ('/:sheetId',             ctrl.getCampaignsForSheet);
/**
 * @openapi
 * /campaign-defs/{sheetId}/{campaignId}:
 *   put:
 *     summary: Opdater en kampagnedefinition i både sheet og DB
 *     tags:
 *       - CampaignDefs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sheetId
 *         required: true
 *         description: Google Sheet ID
 *         schema:
 *           type: string
 *       - in: path
 *         name: campaignId
 *         required: true
 *         description: MongoDB _id for kampagnedefinition
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Felter der skal opdateres (f.eks. name, status)
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               name: "Ny kampagnenavn"
 *               status: "ENABLED"
 *               budget: 1000
 *     responses:
 *       '200':
 *         description: Det opdaterede kampagnedefinition-objekt
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CampaignDef'
 *       '400':
 *         description: Bad request
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Kampagne ikke fundet
 */
campaignRouter.put   ('/:sheetId/:campaignId', ctrl.updateCampaign);
/**
 * @openapi
 * /campaign-defs/{sheetId}/{campaignId}:
 *   delete:
 *     summary: Slet en kampagnedefinition fra både sheet og DB
 *     tags:
 *       - CampaignDefs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sheetId
 *         required: true
 *         description: Google Sheet ID
 *         schema:
 *           type: string
 *       - in: path
 *         name: campaignId
 *         required: true
 *         description: MongoDB _id for kampagnedefinition
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Bekræftelse på sletning
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Kampagne slettet"
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Kampagne ikke fundet
 */
campaignRouter.delete('/:sheetId/:campaignId', ctrl.deleteCampaign);
/**
 * @openapi
 * /campaign-defs/{sheetId}/sync-db:
 *   post:
 *     summary: Synkroniser kampagnedefinitioner fra Google Sheet til MongoDB
 *     tags:
 *       - CampaignDefs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sheetId
 *         required: true
 *         description: Google Sheet ID
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Antal synkroniserede kampagner og data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 synced:
 *                   type: integer
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CampaignDef'
 *       '401':
 *         description: Unauthorized
 */
campaignRouter.post('/:sheetId/sync-db', ctrl.syncCampaignDefs);



export default campaignRouter;
