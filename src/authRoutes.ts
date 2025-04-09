import express from 'express';
import { googleLogin, googleCallback } from './controllers/googleAuthController';
import { setGoogleAdsId, getCustomerList,createGoogleAdsTestAccount } from './controllers/googleAdsController';

const router = express.Router();

// Google OAuth2 login og callback
router.get('/google', googleLogin);
router.get('/google/callback', googleCallback);

// Google Ads API endpoints
router.post('/ads-id', setGoogleAdsId);
router.get('/customers', getCustomerList);
//router.get('/customers/:customerId/campaigns', getCustomerCampaigns);
router.post("/create-test-account", createGoogleAdsTestAccount);

export default router;


