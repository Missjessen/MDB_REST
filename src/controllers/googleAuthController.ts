// src/controllers/googleAuthController.ts
import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { getAuthUrl, verifyGoogleCode } from '../services/googleAuthService';
import { AuthenticatedRequest } from '../interfaces/userReq';

/**
 * Starter Google OAuth2-flow.
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
    return;
  }

  try {
    // 1) Byt koden til Google-tokens + bruger
    const { user, tokens } = await verifyGoogleCode(code);

    // 2) Generér din JWT
    const jwtToken = jwt.sign(
      {
        _id:     user._id.toString(),
        email:   user.email,
        name:    user.name,
        picture: user.picture
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // 3) Log JWT’en i terminalen
    console.log('─────────────────────────────');
    console.log('🟢 Din applikations JWT-token:');
    console.log(jwtToken);
    console.log('─────────────────────────────');

    // 4) Returnér JSON – ingen redirect til frontend
    res.json({
      message:    'Login OK – se server-log for token',
      token:       jwtToken,
      user,
      accessToken: tokens.access_token
    });
    return;
  } catch (err) {
    next(err);
    return;
  }
};

/**
 * Beskyttet endpoint: Henter oplysninger om den loggede bruger.
 * Forudsætter, at requireAuth-middleware har sat req.user.
 */
export const getMe: RequestHandler = (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Ikke logget ind' });
    return;
  }
  const { email, name, picture, exp } = req.user;
  res.json({ user: { email, name, picture, exp } });
};

/**
 * Logout: Her kan du evt. slette refresh token fra DB eller cookie.
 */
export const logout: RequestHandler = (_req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  res.json({ message: 'Logout successful' });
};
