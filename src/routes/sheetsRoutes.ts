import express from 'express';
import { requireAuth } from '../middleware/requireAuth';
//import { syncSheetHandler } from '../controllers/syncSheetController';
import * as ctrl from '../controllers/sheetsController';
//import { syncAllFromSheet } from '../services/sheetService';






const sheetsRouter = express.Router();

// ─── CRUD for Sheets ────────────────────────────────────────────────────────

// Kun loggede brugere må kalde disse endpoints
sheetsRouter.use(requireAuth);

// Opret et nyt sheet
// POST /api/sheets
/**
 * @openapi
 * /sheets:
 *   post:
 *     summary: Opret et nyt Google Sheet
 *     tags:
 *       - Sheets
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Objekt med det nye sheets navn
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Det navn sheet’et skal have
 *             example:
 *               name: "Mit Swagger‐Sheet"
 *     responses:
 *       201:
 *         description: Det oprettede sheet (metadata)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sheet'
 *       400:
 *         description: Manglende eller ugyldigt body (f.eks. name ikke sat)
 *       409:
 *         description: Du har allerede et sheet med det pågældende navn
 */
sheetsRouter.post('/', ctrl.createSheet);

// Hent alle sheets for den loggede bruger
// GET /api/sheets
/**
 * @openapi
 * /sheets:
 *   get:
 *     summary: Hent alle sheets tilknyttet den loggede bruger
 *     tags:
 *       - Sheets
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: En liste af sheet-metadata objekter
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Sheet'
 *             example:
 *               - _id: '60f7c2d1e25e4b3a2b1c4d5e'
 *                 sheetId: '1AbCxyz1234567890'
 *                 name: 'Mit første sheet'
 *                 sheetUrl: 'https://docs.google.com/spreadsheets/d/1AbCxyz1234567890'
 *                 userId: '603d214f1c4ae9311ce2d799'
 */
sheetsRouter.get('/', ctrl.getSheets);

// Hent ét sheet
// GET /api/sheets/:sheetId
/**
 * @openapi
 * /sheets/{id}:
 *   get:
 *     summary: Hent et enkelt sheet ved dets MongoDB _id
 *     tags:
 *       - Sheets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: MongoDB-dokumentets _id for sheet
 *         schema:
 *           type: string
 *           example: '60f7c2d1e25e4b3a2b1c4d5e'
 *     responses:
 *       '200':
 *         description: Ét sheet-objekt
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sheet'
 *       '401':
 *         description: Unauthorized (mangler eller ugyldigt token)
 *       '404':
 *         description: Sheet ikke fundet
 */
sheetsRouter.get('/:id', ctrl.getSheetById);

// Opdater metadata for ét sheet (fx navn)
// PUT /api/sheets/:sheetId
/**
 * @openapi
 * /sheets/{id}:
 *   put:
 *     summary: Opdater metadata for ét sheet (fx navn)
 *     tags:
 *       - Sheets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: MongoDB-dokumentets _id for sheet
 *         schema:
 *           type: string
 *           example: '60f7c2d1e25e4b3a2b1c4d5e'
 *     requestBody:
 *       description: Feltet du ønsker at opdatere (fx name)
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Det nye navn for sheet’et
 *             example:
 *               name: "Mit opdaterede sheet-navn"
 *     responses:
 *       '200':
 *         description: Det opdaterede sheet-objekt
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sheet'
 *       '400':
 *         description: Manglende eller ugyldigt requestBody
 *       '401':
 *         description: Unauthorized (mangler eller ugyldigt token)
 *       '404':
 *         description: Sheet ikke fundet
 */
sheetsRouter.put('/:id', ctrl.updateSheetById);

// Slet ét sheet + tilknyttede campaign-definitions
// DELETE /api/sheets/:sheetId
/**
 * @openapi
 * /sheets/{id}:
 *   delete:
 *     summary: Slet et Sheet (metadata + Drive)
 *     tags:
 *       - Sheets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: MongoDB-dokumentets _id for sheet
 *         schema:
 *           type: string
 *           example: 60f7c2d1e25e4b3a2b1c4d5e
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
 *                   example: Sheet slettet
 *       '404':
 *         description: Sheet ikke fundet
 *       '401':
 *         description: Unauthorized (mangler token)
 */
sheetsRouter.delete('/:id', ctrl.deleteSheetById);

// Kør sync mod Google Ads for ét sheet
// POST /api/sheets/:sheetId/sync
//sheetsRouter.post('/:sheetId/sync', ctrl.syncSheet);

// ─── CRUD all ────────────────────────────────────────────────────────

//sheetsRouter.post ('/:sheetId/sync-db-all', syncAllFromSheet);


// Annoncer


// Sync Ads
//sheetsRouter.post('/sync-sheet/:userId', requireAuth, syncSheetHandler);

//sheetsRouter.post('/', requireAuth, saveSheetMeta); // POST /api/sheets

//sheetsRouter.get('/sheet-link', requireAuth, getSheetLink);

export default sheetsRouter;
