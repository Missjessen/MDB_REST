// src/controllers/googleAuthController.ts

import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
//import { connect, disconnect } from '../repository/database';
import { verifyGoogleCode, getAuthUrl } from '../services/googleAuthService';
import { iUserModel } from '../models/iUserModel';
import { AuthenticatedRequest } from '../interfaces/userReq';
import { OAuth2Client } from 'google-auth-library';

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
export const googleCallback: RequestHandler = async (req, res, next) => {
  const code = req.query.code as string;
  if (!code) {
    res.status(400).json({ error: 'Manglende kode fra Google' });
    return;  // <— return void
  }

  try {
    const { user, tokens } = await verifyGoogleCode(code);
    const jwtToken = jwt.sign(
      { _id: user._id.toString(), email: user.email, name: user.name, picture: user.picture },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    const wantsJson =
      req.query.json === 'true' ||
      req.is('application/json') ||
      (req.get('accept') || '').includes('application/json');

    if (wantsJson) {
      res.json({
        message:     'Login OK',
        token:       jwtToken,
        accessToken: tokens.access_token,
        user
      });
      return;  // <— return void
    }

    // Ellers redirect til frontend
    const frontendUrl = process.env.FRONTEND_URL!;
    res.redirect(`${frontendUrl}/auth/callback?token=${encodeURIComponent(jwtToken)}`);
    return;  // <— return void
  } catch (err) {
    next(err);  // næste middleware/håndterer fejlen
    return;     // <— return void
  }
};


/**
 * Beskyttet endpoint: Henter oplysninger om den loggede bruger.
 * Forudsætter, at requireAuth har placeret JwtUserPayload i req.user.
 */
export const getMe: RequestHandler = (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Ikke logget ind' })
    return
  }

  const { email, name, picture, exp } = req.user

  res.json({
    user: {
      email,
      name,
      picture,
      exp
    }
  })
}
// export const getMe: RequestHandler = (req: AuthenticatedRequest, res) => {
//   if (!req.user) {
//     res.status(401).json({ error: 'Ikke logget ind' });
//     return;
//   }
//   res.json({ message: 'Du er logget ind ✅', user: req.user });
// };

export const logout: RequestHandler = (req, res) => {
  // Fjern evt. cookie
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  })

  res.status(200).json({ message: 'Logout successful' })
}


export const exchangeIdToken: RequestHandler = async (req, res, next) => {
  const { idToken } = req.body;
  if (!idToken) {
    res.status(400).json({ error: 'Manglende idToken' });
    return; 
  }

  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) {
      res.status(400).json({ error: 'Ugyldigt idToken' });
      return;
    }

    let user = await iUserModel.findOne({ googleId: payload.sub });
    if (!user) {
      user = await iUserModel.create({
        email:     payload.email,
        googleId:  payload.sub,
        name:      payload.name,
        picture:   payload.picture,
      });
    }

    const appToken = jwt.sign(
      { _id: user._id.toString(), email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      message:     'Login OK',
      token:       appToken,
      accessToken: idToken,
      user
    });
    return;  

  } catch (err) {
    next(err);
    return;
  }
};