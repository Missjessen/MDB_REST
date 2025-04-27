// src/controllers/googleAuthController.ts

import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { connect, disconnect } from '../repository/database';
import { verifyGoogleCode, getAuthUrl } from '../services/googleAuthService';
import { iUserModel } from '../models/iUserModel';
import { AuthenticatedRequest } from '../interfaces/userReq';

/**
 * Starter Google OAuth2‑flow.
 * Redirecter til Googles samtykkeskærm med alle SCOPES (Ads, Sheets, userinfo).
 */
export const googleLogin: RequestHandler = (_req, res) => {
  const url = getAuthUrl();
  return res.redirect(url);
};

/**
 * Callback fra Google efter login.
 * Bytter kode til tokens, upserter bruger i Mongo, udsteder JWT inkl. tokens.
 */
export const googleCallback: RequestHandler = async (req, res) => {
  const code = req.query.code as string;
  if (!code) {
    res.status(400).json({ error: 'Manglende kode fra Google' });
    return;
  }

  try {
    // Sørg for DB‐forbindelse
    await connect();

    // Håndter code → tokens + opret/oppdatér iUserModel
    const { user, tokens } = await verifyGoogleCode(code);

    // Byg dit eget JWT
    const jwtToken = jwt.sign(
      {
        _id:          user._id.toString(),
        email:        user.email,
        googleId:     user.googleId,
        refreshToken: tokens.refresh_token!,
        accessToken:  tokens.access_token!
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Send cookie + JSON
    res
      .cookie('token', jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      })
      .json({ message: 'Login OK', token: jwtToken, user });
  } catch (err: any) {
    console.error('❌ Fejl under OAuth callback:', err);
    res.status(500).json({ error: 'Fejl under login‑processen' });
  } finally {
    await disconnect();
  }
};

/**
 * Beskyttet endpoint: Henter oplysninger om den loggede bruger.
 * Forudsætter, at requireAuth har placeret JwtUserPayload i req.user.
 */
export const getMe: RequestHandler = (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Ikke logget ind' });
    return;
  }
  res.json({ message: 'Du er logget ind ✅', user: req.user });
};
