// controllers/googleAdsController.ts
import { Request, Response } from 'express';
import { iUserModel } from '../models/iUserModel';
//import { connect, disconnect } from '../repository/database';
//import { getCampaignsForUser } from '../services/googleAdsService';
import { createTestAccount } from '../services/googleAds/createTestAccount';
//import { syncSheetToAds } from '../services/googleAdsSyncService';
//import { google } from 'googleapis';
//import { AuthenticatedRequest } from '../interfaces/userReq';




/**
 * Opretter en testkonto i Google Ads (sandbox-miljø)
 * @route POST /api/ads/create-test-account
 */
export const createGoogleAdsTestAccount = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await createTestAccount();
      res.status(200).json({ message: "Testkonto oprettet", data: result });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  export const setGoogleAdsId = async (req: Request, res: Response): Promise<void> => {
    const { userId, googleAdsCustomerId } = req.body;
  
    if (!googleAdsCustomerId || googleAdsCustomerId.length !== 10) {
      res.status(400).json({ error: "Ugyldigt Google Ads ID" });
      return;
    }
  
    try {
      //await connect();
      const updatedUser = await iUserModel.findByIdAndUpdate(
        userId,
        { googleAdsCustomerId },
        { new: true }
      );
  
      if (!updatedUser) {
        res.status(404).json({ error: "Bruger ikke fundet" });
        return;
      }
  
      res.status(200).json({ message: 'Google Ads ID tilføjet', updatedUser });
    } catch (error) {
      res.status(500).json({ error: 'Fejl ved opdatering af Ads ID: ' + error });
    } 
    //finally {
      //await disconnect();
    //}
  };
  

  export const getCustomerList = async (req: Request, res: Response): Promise<void> => {
    try {
      //await connect();
      const customers = await iUserModel.find({}, 'email googleAdsCustomerId');
  
      if (!customers || customers.length === 0) {
        res.status(404).json({ error: "Ingen kunder fundet" });
        return;
      }
  
      res.status(200).json(customers);
    } catch (error) {
      res.status(500).json({ error: "Fejl ved hentning af kunder: " + error });
    } //finally {
      //await disconnect();
    //}
  };
  

 /*  export const syncSheetHandler = async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user || !user._id) return res.status(401).json({ error: "Login kræves" });
  
    try {
      await connect();
      const userDoc = await iUserModel.findById(user._id);
      if (!userDoc || !userDoc.sheetId || !userDoc.refreshToken) {
        return res.status(400).json({ error: "Bruger mangler Sheet eller refresh token" });
      }
  
      const oAuthClient = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID!,
        process.env.GOOGLE_CLIENT_SECRET!,
        process.env.GOOGLE_REDIRECT_URI!
      );
      oAuthClient.setCredentials({ refresh_token: userDoc.refreshToken });
  
      const result = await syncSheetToAds(oAuthClient, userDoc._id.toString());
      res.status(200).json(result);
  
    } catch (error) {
      res.status(500).json({ error: "Fejl under synkronisering", details: error });
    } finally {
      await disconnect();
    }
  }; */
  







/* import { Request, Response } from 'express';
import { RequestHandler } from 'express';
import { listCustomers } from '../services/googleAdsService';
import { iUserModel } from '../models/iUserModel';
import { disconnect, connect } from '../repository/database';

import { createTestAccount } from "../services/googleAds/createTestAccount";

export const createGoogleAdsTestAccount = async (req: Request, res: Response) => {
    try {
        const result = await createTestAccount();
        res.status(200).json({ message: "Testkonto oprettet", data: result });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// POST /api/google/ads-id
export const setGoogleAdsId: RequestHandler = async (req, res) => {
    const { userId, googleAdsCustomerId } = req.body;

    if (!googleAdsCustomerId || googleAdsCustomerId.length !== 10) {
        res.status(400).json({ error: "Ugyldigt Google Ads ID" });
        return;
    }

    try {
        await connect();
        const updatedUser = await iUserModel.findByIdAndUpdate(
            userId,
            { googleAdsCustomerId },
            { new: true }
        );

        if (!updatedUser) {
            res.status(404).json({ error: "Bruger ikke fundet" });
            return;
        }
        res.status(200).json({ message: 'Google Ads ID tilføjet', updatedUser });
    } catch (error) {
        res.status(500).json({ error: 'Fejl ved opdatering af Ads ID: ' + error });
    } finally {
      setTimeout(async () => {
          await disconnect();
      }, 1000);
  }
};

// GET /api/customers
export const getCustomerList: RequestHandler = async (req, res) => {
    try {
        await connect();
        const customers = await iUserModel.find({}, 'email googleAdsCustomerId');
        if (!customers || customers.length === 0) {
            res.status(404).json({ error: "Ingen kunder fundet" });
            return;
        }
        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({ error: "Fejl ved hentning af kunder: " + error });
    } finally {
      setTimeout(async () => {
          await disconnect();
      }, 1000);
  }

};
 */




/* export const getCustomerList = async (req: Request, res: Response) => {
    try {
        const customers = await listCustomers();
        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({ error: "Fejl ved hentning af kunder: " + error });
    }
}; */

/* export const getCustomerCampaigns = async (req: Request, res: Response) => {
    const { customerId } = req.params;
    const { refreshToken } = req.query; // Forventer refreshToken i forespørgsel

    try {
        if (!customerId || !refreshToken) {
            return res.status(400).json({ error: "Kunde ID eller Refresh Token mangler" });
        }

        // Hent kampagner via service-funktionen
        const campaigns = await fetchCampaignsWithGAQL(customerId, refreshToken as string);

        if (campaigns.length === 0) {
            return res.status(404).json({ message: "Ingen kampagner fundet" });
        }

        res.status(200).json({ campaigns });
    } catch (error) {
        if (error instanceof Error) {
            console.error("Fejl i controller ved hentning af kampagner:", error.message);
        } else {
            console.error("Fejl i controller ved hentning af kampagner:", error);
        }
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: "Fejl ved hentning af kampagner: " + errorMessage });
    }
}; */

/* export const getCustomerCampaigns: RequestHandler = async (req, res) => {
    const { customerId } = req.params;

    try {
        await connect();
        const user = await iUserModel.findOne({ googleAdsCustomerId: customerId });

        if (!user) {
            res.status(404).json({ error: "Kunde ikke fundet" });
            return;
        }

        const campaigns = await fetchCampaigns(user);

        if (!campaigns || campaigns.length === 0) {
            res.status(404).json({ message: "Ingen kampagner fundet for kunden." });
            return;
        }

        res.status(200).json({ campaigns });
    } catch (error) {
        console.error("Fejl ved hentning af kampagner:", error);
        res.status(500).json({ error: "Fejl ved hentning af kampagner: " + error });
    } finally {
        await disconnect();
    }
};
 */