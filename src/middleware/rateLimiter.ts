// src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: {
    status: 429,
    error: 'For mange forespørgsler – prøv igen senere.'
  }
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    status: 429,
    error: 'For mange loginforsøg – prøv igen om lidt.'
  }
});
