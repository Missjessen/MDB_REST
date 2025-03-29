import { getAdsClient } from '../services/googleAdsService';
import { connect, disconnect } from '../repository/database';
import { RequestHandler } from 'express';
import { iUserModel } from '../models/iUserModel';

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
    res.status(200).json({ message: 'Google Ads ID tilføjet', updatedUser });
  } catch (error) {
    res.status(500).send('Fejl ved opdatering af Ads ID: ' + error);
  } finally {
    await disconnect();
  }
}

// GET /api/customers
export const getCustomerList: RequestHandler = async (req, res) => {
    try {
        await connect();
        const customers = await iUserModel.find({}, 'email googleAdsCustomerId'); // Henter kun nødvendige felter
        res.status(200).json(customers);
    } catch (error) {
        res.status(500).send("Fejl ved hentning af kunder: " + error);
    } finally {
        await disconnect();
    }
};

// GET /api/customers/:customerId/campaigns
export const getCustomerCampaigns: RequestHandler = async (req, res) => {
    const { customerId } = req.params;

    try {
        await connect();
        const user = await iUserModel.findOne({ googleAdsCustomerId: customerId });

        if (!user) {
            res.status(404).send("Kunde ikke fundet");
            return;
        }

        const customer = getAdsClient(user);
        const response = await customer.query(`
            SELECT campaign.id, campaign.name, campaign.status
            FROM campaign
            LIMIT 10
        `);
        const campaigns = response.map((row: any) => row.campaign);
        res.status(200).json({ campaigns });
    } catch (error) {
        res.status(500).send("Fejl ved hentning af kampagner: " + error);
    } finally {
        await disconnect();
    }
};
