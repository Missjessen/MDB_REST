// src/services/googleAuthService.ts
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { iUserModel } from '../models/iUserModel';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config();

// Scopes du bruger i hele app’en
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];

// Opretter basis OAuth2‐klient med dine client credentials
export function createOAuthClient(): OAuth2Client {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.GOOGLE_REDIRECT_URI!
  );
}

// Genererer login‐URL (bruges af googleLogin‐controlleren)
export function getAuthUrl(): string {
  const client = createOAuthClient();
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent select_account',
    scope: SCOPES
  });
}

// Verificerer callback, henter tokens, gemmer i DB og returnerer user+tokens
export async function verifyGoogleCode(code: string) {
  const client = createOAuthClient();
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  // Hent brugerinfo
  const oauth2 = google.oauth2({ version: 'v2', auth: client });
  const { data } = await oauth2.userinfo.get();

  // Upsert i DB
  let user = await iUserModel.findOne({ googleId: data.id });
  if (!user) {
    user = new iUserModel({
      googleId:     data.id,
      email:        data.email,
      name:         data.name,
      picture:      data.picture,
      refreshToken: tokens.refresh_token,
      accessToken:  tokens.access_token,
      expiryDate:   tokens.expiry_date ? new Date(tokens.expiry_date) : undefined
    });
  } else {
    user.accessToken  = tokens.access_token!;
    if (tokens.refresh_token) user.refreshToken = tokens.refresh_token;
    if (tokens.expiry_date)   user.expiryDate   = new Date(tokens.expiry_date);
  }
  await user.save();

  // Generér JWT
  const jwtToken = jwt.sign(
    { _id: user._id.toString(), email: user.email, name: user.name },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );

  // DEBUG: print JWT i terminalen
  console.log('🔑 Din applikations JWT:', jwtToken);

  return {
    user: {
      _id:         user._id.toString(),
      email:       user.email,
      name:        user.name,
      picture:     user.picture,
      refreshToken:user.refreshToken,
      accessToken: tokens.access_token
    },
    tokens,
    jwtToken
  };
}

// Hjælper: Hent fornyet OAuth2Client for en given bruger
export async function getAuthClientForUser(userId: string): Promise<OAuth2Client> {
  const user = await iUserModel.findById(userId);
  if (!user || !user.refreshToken) {
    throw new Error('Bruger mangler refreshToken');
  }
  const client = createOAuthClient();
  client.setCredentials({ refresh_token: user.refreshToken });
  // Forny access_token
  const { token } = await client.getAccessToken();
  if (!token) throw new Error('Kunne ikke forny accessToken');
  client.setCredentials({ access_token: token });
  return client;
}
export async function getGoogleAccessToken(refreshToken: string): Promise<string> {
  const client = createOAuthClient();
  client.setCredentials({ refresh_token: refreshToken });
  const { token } = await client.getAccessToken();
  if (!token) throw new Error('Kunne ikke hente access token');
  return token;
}