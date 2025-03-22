export interface IUser {
    name: string
    email: string
    //password?: string  // Gør adgangskode valgfri
    google_ads_id?: string  // MCC-relateret Google Ads ID
    refresh_token?: string  // Bruges til at opdatere Google OAuth-tokens
    access_token?: string   // Nyttig til midlertidige forespørgsler med Google APIs
    sheets_id?: string      // ID til det Google Sheet, der gemmer data
    google_id?: string      // Google ID for OAuth-brugere
    createdAt?: Date        // Til at gemme, hvornår brugeren blev oprettet
    updatedAt?: Date        // Til at registrere, hvornår brugerens data sidst blev opdateret
}

