import { Request } from 'express';

export interface JwtUserPayload {
    _id: string;
    email: string;
    googleId: string;
  }
  
  // 👇 Denne bruges i middleware og controllers
  export interface AuthenticatedRequest extends Request {
    user?: JwtUserPayload;
  }