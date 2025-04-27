// src/interfaces/userReq.ts
import { Request } from 'express';

export interface JwtUserPayload {
  _id: string;
  email: string;
  googleId: string;
  refreshToken: string;
  accessToken: string;
  iat: number;    // følger med fra jwt.verify
  exp: number;    // følger med fra jwt.verify
}

export interface AuthenticatedRequest extends Request {
  user?: JwtUserPayload;
}
