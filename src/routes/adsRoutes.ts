import express from 'express';
import {
  setGoogleAdsId,
  getCustomerList,
  createGoogleAdsTestAccount,
  
} from '../controllers/googleAdsController';
import { requireAuth } from '../middleware/requireAuth';

const adsRouter = express.Router();

// Ads routes
adsRouter.post('/ads-id', requireAuth, setGoogleAdsId);
adsRouter.get('/customers', requireAuth, getCustomerList);
adsRouter.post('/create-test-account', createGoogleAdsTestAccount);
//adsRouter.get('/campaigns/:userId', requireAuth, getUserCampaigns); // ✅ aktiveret igen

export default adsRouter;
