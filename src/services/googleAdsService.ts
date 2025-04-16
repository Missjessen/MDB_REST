// services/googleAdsService.ts
import { GoogleAdsApi } from 'google-ads-api';
import { IUser } from '../interfaces/iUser';

const googleAdsClient = new GoogleAdsApi({
  client_id: process.env.GOOGLE_CLIENT_ID!,
  client_secret: process.env.GOOGLE_CLIENT_SECRET!,
  developer_token: process.env.GOOGLE_DEVELOPER_TOKEN!
});

/**
 * Returnerer en Google Ads API-klient for en specifik bruger
 * @param user - Bruger med refreshToken og googleAdsCustomerId
 * @returns En autoriseret kundeinstans fra GoogleAdsApi
 */
export function getAdsClient(user: IUser) {
  if (!user.refreshToken || !user.googleAdsCustomerId) {
    throw new Error("Bruger mangler Ads-forbindelse");
  }

  return googleAdsClient.Customer({
    customer_id: user.googleAdsCustomerId,
    login_customer_id: user.googleAdsCustomerId,
    refresh_token: user.refreshToken
  });
}

/**
 * Henter de første 10 kampagner for en bruger fra Google Ads
 * @param user - Bruger med Google Ads adgang
 * @returns En liste af kampagner (id, navn, status)
 */
export async function getCampaignsForUser(user: IUser) {
  const client = getAdsClient(user);

  const response = await client.query(`
    SELECT
      campaign.id,
      campaign.name,
      campaign.status
    FROM campaign
    LIMIT 10
  `);

  return response;
}















/* import { GoogleAdsApi } from 'google-ads-api';
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

  


   const client = new GoogleAdsApi({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        developer_token: process.env.GOOGLE_DEVELOPER_TOKEN!,
    });
    
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN!; 
    
    export async function listCustomers() {
        try {
            const customers = await client.listAccessibleCustomers(refreshToken);
            return customers;
        } catch (error) {
            console.error("Fejl ved hentning af kunder:", error);
            throw error;
        }
    }
 */





/*   export const getCustomer = (customerId: string, refreshToken: string) => {
    return client.Customer({
      customer_id: customerId,
      refresh_token: refreshToken,
    });
  }; */

// Henter kampagner fra Google Ads API
/* export async function fetchCampaigns(user: IUser) {
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
} */




    
    
 /*    export async function fetchCampaignsWithGAQL(customerId: string, refreshToken: string) {
        try {
            // Opret kunden
            const customer = client.Customer({
                customer_id: customerId,
                refresh_token: refreshToken,
            });
    
            // Brug GAQL til at hente kampagner
            const query = `
                SELECT 
                    campaign.id, 
                    campaign.name, 
                    campaign.bidding_strategy_type, 
                    campaign_budget.amount_micros, 
                    metrics.cost_micros, 
                    metrics.clicks, 
                    metrics.impressions, 
                    metrics.all_conversions
                FROM campaign
                WHERE campaign.status = "ENABLED"
                LIMIT 5
            `;
    
            const campaigns = await customer.query(query);
    
            // Tjek om kampagner blev hentet
            if (!campaigns || campaigns.length === 0) {
                console.log("🔍 Ingen kampagner fundet.");
                return [];
            }
    
            // Log kampagnerne
            console.log("✅ Kampagner via GAQL:", campaigns);
            return campaigns;
    
        } catch (error) {
            console.error("Fejl under GAQL-hentning af kampagner:" +  error);
            throw error;
        }
    } */
    
   /*  // Testkald
    fetchCampaignsWithGAQL("DIN_CUSTOMER_ID", "DIN_REFRESH_TOKEN"); */
    

    
