import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { iUserModel } from '../models/iUserModel';

export function createOAuthClient(): OAuth2Client {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.GOOGLE_REDIRECT_URI!
  );
}

export async function verifyGoogleCode(code: string) {
  const client = createOAuthClient();
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  const oauth2 = google.oauth2({ version: 'v2', auth: client });
  const { data } = await oauth2.userinfo.get();

  return { tokens, profile: data };
}

export async function saveOrUpdateGoogleUser(profile: any, tokens: any) {
  let user = await iUserModel.findOne({ googleId: profile.id });

  if (!user) {
    user = new iUserModel({
      email: profile.email,
      googleId: profile.id,
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token!,
      expiryDate: new Date(tokens.expiry_date as number)
    });
  } else {
    user.accessToken = tokens.access_token!;
    user.refreshToken = tokens.refresh_token!;
    user.expiryDate = new Date(tokens.expiry_date as number);
  }

  await user.save();
  return user;
}

