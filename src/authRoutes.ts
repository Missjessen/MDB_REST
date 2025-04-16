/* import express from 'express';
import { googleLogin, googleCallback, getMe } from './controllers/googleAuthController';
import { setGoogleAdsId, getCustomerList,createGoogleAdsTestAccount } from './controllers/googleAdsController';
import { requireAuth } from './middleware/requireAuth';
import { setSheetId, createAndSaveSheet,  } from './controllers/sheetsIdController';


const router = express.Router();

// Google OAuth2 login og callback
router.get('/google', googleLogin); //Starter Google OAuth2 flow
router.get('/google/callback', googleCallback); ///Får token, gemmer bruger
router.get("/me", requireAuth, getMe); //Frontend kontrol af login

// Google Ads API endpoints
router.post('/ads-id', requireAuth, setGoogleAdsId);//Gemmer Ads ID
router.get('/customers', requireAuth, getCustomerList);//Henter Ads kunder
//router.get('/customers/:customerId/campaigns', getCustomerCampaigns);
router.post("/create-test-account", createGoogleAdsTestAccount);//Opretter testkonto

//sheets
router.post('/sheet-id', setSheetId);
router.post('/create-sheet', requireAuth, createAndSaveSheet); // skal beskyttes
router.get('/google/sheet-link', requireAuth, getSheetLink);

export default router;

 */
