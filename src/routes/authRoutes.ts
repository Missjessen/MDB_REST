import express from 'express';
import { googleLogin, googleCallback, getMe, logout } from '../controllers/googleAuthController';
import { requireAuth } from '../middleware/requireAuth';
import { loginLimiter } from '../middleware/rateLimiter';

const authRouter = express.Router();
/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Google OAuth2-login og brugerinfo
 */
/**
 * @openapi
 * /auth/google:
 *   get:
 *     summary: Initier Google OAuth-flow
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirect til Googles samtykkeskærm
 */
authRouter.get('/google', loginLimiter, googleLogin);
/**
 * @openapi
 * /auth/google/callback:
 *   get:
 *     summary: Callback fra Google OAuth-flow
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: Autorisationskode fra Google
 *     responses:
 *       200:
 *         description: JWT + brugerobjekt
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Manglende eller ugyldig kode
 *       500:
 *         description: Fejl under login-processen
 */
authRouter.get('/google/callback', googleCallback);
/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Hent information om den loggede bruger
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Brugerobjekt
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Ikke logget ind eller ugyldigt token
 */
authRouter.get('/me', requireAuth, getMe);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Clears JWT cookie on the server
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Logout successful
 */
authRouter.post('/logout', logout)

export default authRouter;
