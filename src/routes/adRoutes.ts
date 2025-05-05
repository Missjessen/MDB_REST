// src/routes/adRoutes.ts
import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import * as ctrl from '../controllers/adDefsController';

const adRouter = Router();

adRouter.use(requireAuth);
/**
 * @openapi
 * /ad-defs/{sheetId}:
 *   get:
 *     summary: Hent alle annonce-definitioner for et specifikt sheet
 *     tags:
 *       - AdDefs
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
 *         description: En liste af annonce-definitioner
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AdDef'
 *       '401':
 *         description: Unauthorized (mangler eller ugyldigt token)
 */
adRouter.get('/:sheetId', ctrl.getAdsForSheet);
/**
 * @openapi
 * /ad-defs/{sheetId}/{adId}:
 *   put:
 *     summary: Opdater en annonce-definition i både sheet og DB
 *     tags:
 *       - AdDefs
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
 *         name: adId
 *         required: true
 *         description: MongoDB _id for annonce-definition
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Felter der skal opdateres (f.eks. headline1, description)
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               headline1: "Nyt første overskrift"
 *               headline2: "Anden overskrift"
 *               description: "Opdateret beskrivelse"
 *               finalUrl: "https://example.com"
 *     responses:
 *       '200':
 *         description: Det opdaterede annonce-definition-objekt
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdDef'
 *       '400':
 *         description: Bad request
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Annonce ikke fundet
 */
adRouter.put('/:sheetId/:adId', ctrl.updateAd);
/**
 * @openapi
 * /ad-defs/{sheetId}/{adId}:
 *   delete:
 *     summary: Slet en annonce-definition fra både sheet og DB
 *     tags:
 *       - AdDefs
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
 *         name: adId
 *         required: true
 *         description: MongoDB _id for annonce-definition
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
 *                   example: "Annonce slettet"
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Annonce ikke fundet
 */
adRouter.delete('/:sheetId/:adId', ctrl.deleteAd);
/**
 * @openapi
 * /ad-defs/{sheetId}/sync-db:
 *   post:
 *     summary: Synkroniser annoncer fra Google Sheet til MongoDB
 *     tags:
 *       - AdDefs
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
 *         description: Antal synkroniserede annoncer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 synced:
 *                   type: integer
 *                   example: 12
 *       '401':
 *         description: Unauthorized
 */
adRouter.post('/:sheetId/sync-db' , ctrl.syncAds);

export default adRouter;
