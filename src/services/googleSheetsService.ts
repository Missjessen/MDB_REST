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
            customer_id: process.env.GOOGLE_TEST_ACCOUNT_ID!,      // Testkontoens ID
            login_customer_id: process.env.GOOGLE_TEST_ACCOUNT_ID!, // Samme ID her
            refresh_token: user.refreshToken!,
        });
    } catch (error) {
        console.error("Fejl ved oprettelse af Google Ads klient: ", error);
        throw error;
    }
}
// Henter sheets fra Google Sheets API

