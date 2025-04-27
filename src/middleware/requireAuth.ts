// src/middleware/requireAuth.ts
import { RequestHandler, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, JwtUserPayload } from '../interfaces/userReq';

export const requireAuth: RequestHandler = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  // Hent JWT fra cookie eller Authorization-header
  const authHeader = req.headers.authorization;
  const token =
    req.cookies.token ??
    (authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null);

  if (!token) {
    // Sender svar og stopper funktionen
    res.status(401).json({ error: 'Ingen adgang. Mangler token.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtUserPayload;
    // Fold payload ud på req.user
    req.user = {
      _id: decoded._id,
      email: decoded.email,
      googleId: decoded.googleId,
      refreshToken: decoded.refreshToken,
      accessToken: decoded.accessToken,
      iat: decoded.iat,
      exp: decoded.exp
    };
    next(); // Går videre til næste middleware/handler
  } catch (err) {
    // Sender svar og stopper funktionen
    res.status(401).json({ error: 'Ugyldigt eller udløbet token.' });
    return;
  }
};
