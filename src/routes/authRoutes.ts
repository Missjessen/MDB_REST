import express from 'express';
import { googleLogin, googleCallback, getMe } from '../controllers/googleAuthController';
import { requireAuth } from '../middleware/requireAuth';

const authRouter = express.Router();

authRouter.get('/google', googleLogin);
authRouter.get('/google/callback', googleCallback);
authRouter.get('/me', requireAuth, getMe);

export default authRouter;
