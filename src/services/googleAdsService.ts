import { GoogleAdsApi } from 'google-ads-api';
import { IUser } from '../interfaces/IUser';
import { google } from 'googleapis';

/* export function getAdsClient(user: IUser) {
  const api = new GoogleAdsApi({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    developer_token: process.env.GOOGLE_DEVELOPER_TOKEN!,
  });

  return api.Customer({
    customer_id: user.googleAdsCustomerId!,
    refresh_token: user.refreshToken!,
    login_customer_id: user.googleAdsCustomerId!,
  });
} */
/**
 * Hjælpefunktion til at oprette en Google Ads klient
 * for en specifik bruger
 */
export function getAdsClient(user: any) {
    // Implementer din Google Ads klient-logik her
    // Eksempel:
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    
    auth.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken
    });
  
    return new google.ads.googleads.v8.GoogleAdsClient({
      auth
    });
  }


