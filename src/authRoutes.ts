import express from 'express';
import { googleLogin, googleCallback } from './controllers/googleAuthController';
import { setGoogleAdsId, getCustomerList, getCustomerCampaigns } from './controllers/googleAdsController';

const router = express.Router();

// Google OAuth2 login og callback
router.get('/auth/google', googleLogin);
router.get('/auth/google/callback', googleCallback); // 🚨 Denne rute skal matche `redirect_uri`

// Google Ads API endpoints
router.post('/ads-id', setGoogleAdsId);
router.get('/customers', getCustomerList);
router.get('/customers/:customerId/campaigns', getCustomerCampaigns);

export default router;

