// src/controllers/googleAuthController.ts

import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
//import { connect, disconnect } from '../repository/database';
import { verifyGoogleCode, getAuthUrl } from '../services/googleAuthService';
//import { iUserModel } from '../models/iUserModel';
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
export const googleCallback: RequestHandler = async (req, res, next) => {
  const code = req.query.code as string;

  if (!code) {
    res.status(400).json({ error: 'Manglende kode fra Google' });
    return;
  }

  try {
    const { user, tokens } = await verifyGoogleCode(code);

    const jwtToken = jwt.sign(
      {
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
        picture: user.picture
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // ✅ VIGTIGT: Ingen return her – bare send JSON
    res.json({
      message: 'Login OK',
      token: jwtToken,
      user,
      accessToken: tokens.access_token
    });

  } catch (err) {
    next(err);
  }
};

// export const googleCallback: RequestHandler = async (req, res, next) => {
//   const code = req.query.code as string
//   if (!code) {
//     res.status(400).json({ error: 'Manglende kode fra Google' })
//     return
//   }

//   try {
//     const { user, tokens } = await verifyGoogleCode(code)

//     const jwtToken = jwt.sign(
//       {
//         _id: user._id.toString(),
//         email: user.email,
//         name: user.name,
//         picture: user.picture,
//         //exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60
//       },
//       process.env.JWT_SECRET!,
//       { expiresIn: '7d' }
//     )

//     res.cookie('token', jwtToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'lax',
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     })

//     const wantsJson =
//       req.query.json === 'true' || req.is('application/json') || !process.env.FRONTEND_URL

//     if (wantsJson) {
//       res.json({ message: 'Login OK', token: jwtToken, user })
//     } else {
//       const frontendUrl = process.env.FRONTEND_URL!
//       res.redirect(`${frontendUrl}/auth/callback?token=${jwtToken}`)
//     }
//   } catch (err) {
//     next(err)
//   }
// }


// export const googleCallback: RequestHandler = async (req, res, next) => {
//   const code = req.query.code as string;
//   if (!code) {
//     res.status(400).json({ error: 'Manglende kode fra Google' });
//     return;               // <-- returnerer void
//   }

//   try {
//     const { user, tokens } = await verifyGoogleCode(code);

//     // Byg JWT
//     const jwtToken = jwt.sign(
//       { _id: user._id.toString(), email: user.email, /* … */ },
//       process.env.JWT_SECRET!,
//       { expiresIn: '7d' }
//     );

//     // Sæt cookie
//     res.cookie('token', jwtToken, {
//       httpOnly: true,
//       secure:   process.env.NODE_ENV === 'production',
//       sameSite: 'lax',
//       maxAge:   7 * 24 * 60 * 60 * 1000,
//     });

//     // Hvis klienten vil have JSON (f.eks. ?json=true)
//     if (req.query.json === 'true' || req.is('application/json')) {
//       res.json({ message: 'Login OK', token: jwtToken, user });
//       return;             // <-- returnerer void
//     }

//     // Ellers redirect til frontend
//     const frontendUrl = process.env.FRONTEND_URL!;
//     res.redirect(`${frontendUrl}/auth/callback?token=${jwtToken}`);
//     return;               // <-- returnerer void

//   } catch (err) {
//     next(err);            // giver fejlen videre til Express’ error-handler
//     return;               // <-- returnerer void
//   }
// };


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