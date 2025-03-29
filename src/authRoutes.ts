import express from 'express';
import { googleLogin, googleCallback } from './controllers/googleAuthController';
import { setGoogleAdsId, getCustomerList, getCustomerCampaigns } from './controllers/googleAdsController';

const router = express.Router();

router.get('/google', googleLogin); 
router.get('/google/callback', googleCallback); // 🚨 Denne rute skal matche `redirect_uri`


// Google Ads
router.post('/ads-id', setGoogleAdsId);
router.get('/customers', getCustomerList);
router.get('/customers/:customerId/campaigns', getCustomerCampaigns);

export default router;