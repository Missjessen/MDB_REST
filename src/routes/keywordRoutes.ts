// src/routes/keywordRoutes.ts
import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import * as ctrl from '../controllers/keywordDefsController';

const keywordsRouter = Router({ mergeParams: true });
keywordsRouter.use(requireAuth);
/**
 * @openapi
 * /keyword-defs/{sheetId}:
 *   get:
 *     summary: Hent alle keyword-definitioner for et specifikt sheet
 *     tags:
 *       - KeywordDefs
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
 *         description: En liste af keyword-definitioner
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/KeywordDef'
 *       '401':
 *         description: Unauthorized (mangler eller ugyldigt token)
 */
keywordsRouter.get('/:sheetId',          ctrl.getKeywordsForSheet);
/**
 * @openapi
 * /keyword-defs/{sheetId}/{keywordId}:
 *   put:
 *     summary: Opdater en keyword-definition i både sheet og DB
 *     tags:
 *       - KeywordDefs
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
 *         name: keywordId
 *         required: true
 *         description: MongoDB _id for keyword-definition
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Felter der skal opdateres (fx keyword, matchType, cpc)
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               keyword: "nyt søgeord"
 *               matchType: "EXACT"
 *               cpc: 2.5
 *     responses:
 *       '200':
 *         description: Det opdaterede keyword-definition-objekt
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KeywordDef'
 *       '400':
 *         description: Bad request
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Keyword ikke fundet
 */
keywordsRouter.put('/:sheetId/:keywordId', ctrl.updateKeyword);
/**
 * @openapi
 * /keyword-defs/{sheetId}/{keywordId}:
 *   delete:
 *     summary: Slet en keyword-definition fra både sheet og DB
 *     tags:
 *       - KeywordDefs
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
 *         name: keywordId
 *         required: true
 *         description: MongoDB _id for keyword-definition
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
 *                   example: "Keyword slettet i både Sheet og DB"
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Keyword ikke fundet
 */
keywordsRouter.delete('/:sheetId/:keywordId', ctrl.deleteKeyword);
/**
 * @openapi
 * /keyword-defs/{sheetId}/sync:
 *   post:
 *     summary: Synkroniser keywords fra Google Sheet til MongoDB
 *     tags:
 *       - KeywordDefs
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
 *         description: Antal opdaterede keywords
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 updated:
 *                   type: integer
 *                   example: 12
 *       '401':
 *         description: Unauthorized
 */
keywordsRouter.post('/:sheetId/sync',     ctrl.syncKeywords);

export default keywordsRouter;
