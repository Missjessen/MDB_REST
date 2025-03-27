export interface IUser {
    email: string;                    // Brugerens Google-email
    googleId: string;                // Unik Google-bruger-ID (fra userinfo.get())
    accessToken: string;             // OAuth2 access_token
    refreshToken: string;            // OAuth2 refresh_token
    expiryDate: Date;                // Token udløbsdato
  
    googleAdsCustomerId?: string;    // Valgfrit: MCC / Client ID fra Google Ads
    sheetId?: string;                // Valgfrit: Google Sheet ID, hvis du arbejder med Sheets
  }
  

/* export interface IUser {
    email: String;
    googleAdsId: String;
    accessToken: String;
    refreshToken: String;
    expiryDate: Date;
  
} */

/* name: string
email: string
//password?: string  // Gør adgangskode valgfri
google_ads_id?: string  // MCC-relateret Google Ads ID
refresh_token?: string  // Bruges til at opdatere Google OAuth-tokens
access_token?: string   // Nyttig til midlertidige forespørgsler med Google APIs
sheets_id?: string      // ID til det Google Sheet, der gemmer data
google_id?: string      // Google ID for OAuth-brugere
createdAt?: Date        // Til at gemme, hvornår brugeren blev oprettet
updatedAt?: Date        // Til at registrere, hvornår brugerens data sidst blev opdateret */