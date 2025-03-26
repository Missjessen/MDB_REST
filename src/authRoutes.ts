import express from 'express';

import { googleLogin, googleCallback } from './controllers/googleAuthController';


const router = express.Router();

router.get('/google', googleLogin); 
router.get('/google/callback', googleCallback); // 🚨 Denne rute skal matche `redirect_uri`

export default router;