import express from 'express';
import { googleLogin, googleCallback, getMe } from '../controllers/googleAuthController';
import { requireAuth } from '../middleware/requireAuth';
import { loginLimiter } from '../middleware/rateLimiter';

const authRouter = express.Router();

authRouter.get('/google', loginLimiter, googleLogin);
authRouter.get('/google/callback', googleCallback);
authRouter.get('/me', requireAuth, getMe);

export default authRouter;
