import { GoogleAdsApi } from 'google-ads-api';
import { IUser } from '../interfaces/iUser';

// Opretter Google Ads API-klient
export async function getAdsClient(user: IUser) {
    try {
        const client = new GoogleAdsApi({
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            developer_token: process.env.GOOGLE_DEVELOPER_TOKEN!,
        });

        return client.Customer({
            customer_id: user.googleAdsCustomerId!,
            login_customer_id: user.googleAdsCustomerId!,
            refresh_token: user.refreshToken!,
        });
    } catch (error) {
        console.error("Fejl ved oprettelse af Google Ads klient: ", error);
        throw error;
    }
}

// Henter kampagner fra Google Ads API
export async function fetchCampaigns(user: IUser) {
    try {
        const customer = await getAdsClient(user); // <-- Bemærk: await tilføjet her

        // Udfør Google Ads Query Language (GAQL) forespørgsel
        const response = await customer.query(`
            SELECT campaign.id, campaign.name, campaign.status
            FROM campaign
            LIMIT 10
        `);

        // Ekstraherer kampagner fra resultatet
        const campaigns = response.map((row: any) => row.campaign);
        console.log("✅ Kampagner hentet: ", campaigns);
        return campaigns;
    } catch (error) {
        console.error("Fejl under hentning af kampagner: ", error);
        throw error;
    }
}
