// src/routes/authRoutes.ts
import express from 'express'
import { googleLogin, googleCallback, getMe, logout } from '../controllers/googleAuthController'
import { requireAuth } from '../middleware/requireAuth'
import { loginLimiter } from '../middleware/rateLimiter'
import { createOAuthClient } from '../services/googleAuthService'

const authRouter = express.Router()

/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Google OAuth2‐login og brugerinfo
 */

/**
 * @openapi
 * /auth/google:
 *   get:
 *     summary: Initier Google OAuth2 Authorization Code‐flow (PKCE)
 *     tags: [Auth]
 *     responses:
 *       '302':
 *         description: Redirect til Googles samtykkeskærm
 */
authRouter.get('/google', loginLimiter, googleLogin)

/**
 * @openapi
 * /auth/google/callback:
 *   get:
 *     summary: Callback fra Google OAuth2‐flow
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: Autorisationskode fra Google
 *     responses:
 *       '200':
 *         description: Din egen JWT + brugerobjekt + Google access token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 accessToken:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       '400':
 *         description: Manglende eller ugyldig kode
 *       '500':
 *         description: Fejl under login‐processen
 */
authRouter.get('/google/callback', googleCallback)

// GET /auth/google  (starter Google‐flowet)
/**
 * @openapi
 * /auth/google:
 *   get:
 *     summary: Initier Google OAuth2 PKCE‐flow
 *     security:
 *       - googleOAuth: []
 *     responses:
 *       302:
 *         description: Redirect til Google samtykkeskærm
 */
authRouter.get('/google', loginLimiter, googleLogin);

// POST /auth/token  (Swagger UI bytter code + verifier til JSON‐tokens)
/**
 * @openapi
 * /auth/token:
 *   post:
 *     summary: Exchange PKCE code + verifier for Google OAuth2 tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, codeVerifier]
 *             properties:
 *               code:
 *                 type: string
 *               codeVerifier:
 *                 type: string
 *     responses:
 *       200:
 *         description: Google OAuth2 tokens
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                 refresh_token:
 *                   type: string
 *                 id_token:
 *                   type: string
 *                 expires_in:
 *                   type: integer
 *       400: { description: Manglende code eller codeVerifier }
 *       500: { description: Intern serverfejl }
 */
authRouter.post('/token', async (req, res, next) => {
  try {
    const { code, codeVerifier } = req.body;
    if (!code || !codeVerifier) {
      res.status(400).json({ error: 'code og codeVerifier kræves' });
      return;
    }
    const client = createOAuthClient();
    const { tokens } = await client.getToken({ code, codeVerifier });
    res.json(tokens);
    return;
  } catch (err) {
    next(err);
    return;
  }
});
  

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Hent information om den loggede bruger
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Brugerobjekt
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '401':
 *         description: Ikke logget ind eller ugyldigt token
 */
authRouter.get('/me', requireAuth, getMe)

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     responses:
 *       '200':
 *         description: Logout successful
 */
authRouter.post('/logout', logout)

export default authRouter
