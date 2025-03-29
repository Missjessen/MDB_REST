export interface User  extends Document {
    id: string;
    name: string;
    email: string;
    password: string;
    createdAt: Date;

      // Google integration
    googleId?: string;
    accessToken?: string;
    refreshToken?: string;
    expiryDate?: Date;
    isGoogleConnected?: boolean;

    // Google Ads integration}
    googleAdsCustomerId?: string;
    sheetId?: string;
}