import { GoogleAdsApi } from "google-ads-api";
import * as dotenv from "dotenv";

dotenv.config();

async function createTestAccount() {
    try {
        const client = new GoogleAdsApi({
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            developer_token: process.env.GOOGLE_DEVELOPER_TOKEN!,
        });

        const customer = client.Customer({
            customer_id: process.env.GOOGLE_TEST_ACCOUNT_ID!,
            refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
            login_customer_id: process.env.GOOGLE_MCC_ID!, // Manager konto ID
        });

        // Henter kampagner
        const campaigns = await customer.query(`
            SELECT campaign.id, campaign.name, campaign.status
            FROM campaign
            WHERE campaign.status = 'ENABLED'
        `);

        console.log("Kampagner:", campaigns);
    } catch (error) {
        console.error("Fejl ved hentning af kampagner:", error);
    }
}

createTestAccount();
