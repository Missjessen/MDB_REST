// src/interfaces/userReq.ts
import { Request } from 'express';

export interface JwtUserPayload {
  _id: string
  email: string
  name: string         // ✅ korrekt type
  picture: string      // ✅ korrekt type
  googleId?: string    // valgfri hvis ikke i JWT
  refreshToken?: string
  accessToken?: string
  iat: number
  exp: number
}

export interface AuthenticatedRequest extends Request {
  user?: JwtUserPayload;
}
