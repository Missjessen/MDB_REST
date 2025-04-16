import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { connect, disconnect } from '../repository/database';
import {
  createOAuthClient,
  verifyGoogleCode,
  saveOrUpdateGoogleUser
} from '../services/googleAuthService';
import { AuthenticatedRequest } from '../interfaces/userReq';


/**
 * Starter Google OAuth2 login flow.
 * Redirecter brugeren til Googles samtykkeside.
 *
 * Scopes inkluderer:
 * - Google Ads adgang
 * - Google Sheets adgang
 * - Brugerens e-mail og profiloplysninger
 * 
 * @param req - Express Request-objekt
 * @param res - Express Response-objekt
 */

export async function googleLogin(req: Request, res: Response) {
  const client = createOAuthClient();

  const url = client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/adwords',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ]
  });

  res.redirect(url);
}

/**
 * Callback endpoint fra Google OAuth2 flow.
 * Validerer adgangskoden (authorization code),
 * henter adgangstoken og brugerdata, og gemmer/ opdaterer brugeren i databasen.
 * Opretter herefter JWT-token og sætter det som httpOnly-cookie.
 *
 * Fejltyper håndteres med passende HTTP-statuskoder:
 * - 400: Manglende eller ugyldig kode
 * - 500: Databasefejl eller tokenfejl
 * 
 * @param req - Express Request-objekt
 * @param res - Express Response-objekt
 */

export async function googleCallback(req: Request, res: Response) {
  const { code } = req.query;

  if (!code) {
    res.status(400).json({ error: 'Manglende kode fra Google' });
    return;
  }

  try {
    await connect();

    const { tokens, profile } = await verifyGoogleCode(code as string);
    const user = await saveOrUpdateGoogleUser(profile, tokens);

    if (!user) {
      res.status(500).json({ error: 'Fejl under lagring af bruger' });
      return;
    }

    const jwtToken = jwt.sign(
      {
        _id: user._id.toString(),
        email: user.email,
        googleId: user.googleId
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({ message: 'Login OK', user, token: jwtToken });

  } catch (error) {
    console.error("❌ Fejl under Google callback:", error);
    res.status(500).json({ error: 'Fejl under login-processen' });
  } finally {
    await disconnect();
  }
}

/**
 * Returnerer oplysninger om den aktuelt loggede ind bruger.
 * Forudsætter at `requireAuth` middleware allerede har valideret JWT-token.
 * 
 * @param req - Request med bruger fra JWT
 * @param res - JSON-svar med brugerdata eller 401 hvis ikke logget ind
 */

export const getMe = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Ikke logget ind' });
    return;
  }

  res.json({
    message: "Du er logget ind ✅",
    user: req.user
  });
};

/* import jwt from 'jsonwebtoken';
import { Request, Response} from 'express';
import { iUserModel } from '../models/iUserModel';
import { google } from 'googleapis';
import { connect, disconnect } from '../repository/database';
import { withDatabase } from '../repository/database';
import { AuthenticatedRequest } from '../interfaces/userReq' 



export async function googleLogin(req: Request, res: Response) {
    const client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID!,
      process.env.GOOGLE_CLIENT_SECRET!,
      process.env.GOOGLE_REDIRECT_URI!
    );
  
    const url = client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/adwords',
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ]
    });
  
    res.redirect(url);
  }

  export async function googleCallback(req: Request, res: Response) {
    const { code } = req.query;
  
    const client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID!,
      process.env.GOOGLE_CLIENT_SECRET!,
      process.env.GOOGLE_REDIRECT_URI!
    );
  
    if (!code) {
      res.status(400).json({ error: 'Manglende kode fra Google' });
      return;
    }
  
    try {
      await connect();
  
      const { tokens } = await client.getToken(code as string);
      client.setCredentials(tokens);
  
      const oauth2 = google.oauth2({ version: 'v2', auth: client });
      const { data } = await oauth2.userinfo.get();
  
      console.log("✅ Tokens:", tokens);
      console.log("👤 Brugerdata:", data);
  
      const user = await withDatabase(async () => {
        let user = await iUserModel.findOne({ googleId: data.id });
  
        if (!user) {
          user = new iUserModel({
            email: data.email,
            googleId: data.id,
            accessToken: tokens.access_token!,
            refreshToken: tokens.refresh_token!,
            expiryDate: new Date(tokens.expiry_date as number)
          });
          await user.save();
          console.log("✅ Ny bruger gemt:", user);
        } else {
          user.accessToken = tokens.access_token!;
          user.refreshToken = tokens.refresh_token!;
          user.expiryDate = new Date(tokens.expiry_date as number);
          await user.save();
          console.log("✅ Bruger opdateret:", user);
        }
  
        return user;
      });
  
      if (!user) {
        res.status(500).json({ error: 'Fejl under lagring af bruger' });
        return;
      }
  
      // 🔐 Lav JWT-token
      const jwtToken = jwt.sign(
        {
            _id: user._id.toString(), // 👈 vigtigt: string
            email: user.email,
            googleId: user.googleId
          },
          process.env.JWT_SECRET!,
          { expiresIn: '7d' }
        );
  
      // 🍪 Send token som httpOnly cookie
      res.cookie("token", jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // kun HTTPS i prod
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
  
      // ✅ Login succesfuld
      res.status(200).json({ message: 'Login OK', user, token: jwtToken });

    } catch (error) {
      console.error("❌ Fejl under Google callback:", error);
      res.status(500).json({ error: 'Fejl under login-processen' });
    } finally {
      await disconnect();
    }
  }
        
  export const getMe = (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: 'Ikke logget ind' });
      return;
    }
  
    res.json({
      message: "Du er logget ind ✅",
      user: req.user
    });
  };


        async function saveTokensToDatabase(userId: string, tokens: any) {
            await iUserModel.findOneAndUpdate(
                { googleAdsId: userId },
                {
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token,
                    expiryDate: new Date(tokens.expiry_date as number),
                },
                { upsert: true }
            );
        }
 */