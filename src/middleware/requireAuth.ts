import { JwtUserPayload, AuthenticatedRequest } from '../interfaces/userReq';
import jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const bearerHeader = req.headers.authorization;
  const token =
    req.cookies.token ||
    (bearerHeader && bearerHeader.startsWith("Bearer ")
      ? bearerHeader.split(" ")[1]
      : null);
      
  if (!token) {
    res.status(401).json({ error: 'Ingen adgang. Mangler token.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtUserPayload;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Ugyldigt token.' });
  }
};
