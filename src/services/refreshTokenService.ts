import { Credentials, OAuth2Client } from 'google-auth-library';
import { iUserModel } from '../models/iUserModel';

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

export async function refreshGoogleToken(userId: string) {
    const user = await iUserModel.findOne({ googleAdsId: userId });

    if (!user) throw new Error("Bruger ikke fundet");

    const { credentials: tokens } = await client.refreshAccessToken();
    await saveTokensToDatabase(userId, tokens);

    return tokens;
}
function saveTokensToDatabase(userId: string, tokens: Credentials) {
    throw new Error('Function not implemented.');
}

