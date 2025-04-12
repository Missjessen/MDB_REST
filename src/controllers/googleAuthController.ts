import jwt from 'jsonwebtoken';
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
