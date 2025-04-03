import { Request, Response } from 'express';
import { RequestHandler } from 'express';
import { fetchCampaigns } from '../services/googleAdsService';
import { iUserModel } from '../models/iUserModel';
import { disconnect, connect } from '../repository/database';

// Håndtering af at hente kampagner
export const getCustomerCampaigns: RequestHandler = async (req, res) => {
    const { customerId } = req.params;

    try {
        await connect();
        const user = await iUserModel.findOne({ googleAdsCustomerId: customerId });

        if (!user) {
            res.status(404).json({ error: "Kunde ikke fundet" });
            return;
        }

        //const campaigns = await fetchCampaigns(user);
        //res.status(200).json({ campaigns });
        res.status(200).json({ message: "Kampagner hentet" });
    } catch (error) {
        console.error("Fejl ved hentning af kampagner:", error);
        res.status(500).json({ error: "Fejl ved hentning af kampagner: " + error });
    } finally {
      setTimeout(async () => {
          await disconnect();
      }, 1000);
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
