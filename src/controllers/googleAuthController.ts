import { Request, Response, NextFunction } from 'express';
//import { generateAuthUrl, getGoogleTokens, getUserInfo } from '../services/googleAuthService';
import { iUserModel } from '../models/iUserModel';
import { google } from 'googleapis';


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
  

// ➤ 1. Login Endpoint - Omdiriger til Googles OAuth 2.0-side
/* export async function googleLogin(req: Request, res: Response) {
    const url = `https://accounts.google.com/o/oauth2/auth?` +
        `client_id=${process.env.GOOGLE_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(process.env.GOOGLE_REDIRECT_URI as string)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent('https://www.googleapis.com/auth/adwords https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile')}` +
        `&access_type=offline` +
        `&prompt=consent`;

    console.log("✅ OAuth URL:", url);
    res.redirect(url);
}  */
/* export async function googleLogin(req: Request, res: Response) {
    const url = client.generateAuthUrl({
    // Sikrer refresh_token
        access_type: 'offline',    
        prompt: 'consent',         
        scope: [
            'https://www.googleapis.com/auth/adwords',
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile'
        ]
    });

    console.log("✅ OAuth URL:", url); // Debugging
    res.redirect(url);
} */
// ➤ 2. Callback Endpoint - Håndterer token-exchange
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
      const { tokens } = await client.getToken(code as string);
      client.setCredentials(tokens);
  
      const oauth2 = google.oauth2({ version: 'v2', auth: client });
      const { data } = await oauth2.userinfo.get();
  
      console.log('✅ Tokens:', tokens);
      console.log('👤 Brugerdata:', data);
  
      // Opret eller opdater bruger her...
  
      res.status(200).json({ message: 'Login OK', tokens, user: data });
  
    } catch (error) {
      console.error('❌ Fejl i callback:', error);
      res.status(500).json({ error: 'Fejl i callback' });
    }
  }
  

/* export async function googleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { code } = req.query;
  
    if (!code) {
      res.status(400).json({ error: 'Manglende autorisationskode.' });
      return;
    }
  
    try {
      const tokenResponse = await client.getToken(code as string);
      const tokens = tokenResponse.tokens;
  
      client.setCredentials(tokens);
  
      const oauth2 = google.oauth2({ version: 'v2', auth: client });
      const { data } = await oauth2.userinfo.get();
  
      // 📌 Her bruger vi userinfo fra Google:
      const { email, id: googleId } = data;
  
      if (!email || !googleId) {
        res.status(400).json({ error: 'Mangler e-mail eller Google ID.' });
        return;
      }
  
      // 📌 Find bruger med googleId (eller email hvis du foretrækker det)
      let user = await iUserModel.findOne({ googleId });
  
      if (!user) {
        // 🆕 Opret ny bruger
        user = new iUserModel({
          email,
          googleId,
          accessToken: tokens.access_token ?? '',
          refreshToken: tokens.refresh_token ?? '',
          expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : new Date()
        });
      } else {
        // 🔁 Opdater tokens hvis nødvendigt
        if (tokens.access_token) user.accessToken = tokens.access_token;
        if (tokens.refresh_token) user.refreshToken = tokens.refresh_token;
        if (tokens.expiry_date) user.expiryDate = new Date(tokens.expiry_date);
      }
  
      await user.save();
  
      res.status(200).json({
        message: 'Login succesfuldt 🎉',
        user: {
          email: user.email,
          googleId: user.googleId
        }
      });
  
    } catch (error) {
      console.error('❌ Fejl under callback:', error);
      res.status(500).json({ error: 'Token exchange fejlede.' });
    }
  }
   */

async function saveTokensToDatabase(userId: string, tokens: any) {
    await iUserModel.findOneAndUpdate(
        { googleAdsId: userId },
        {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiryDate: new Date(tokens.expiry_date as number)
        },
        { upsert: true }
    );
}

/* export const googleLogin = (req: Request, res: Response): void => {
    const url = generateAuthUrl();
    res.redirect(url);
};

export const googleCallback = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const { code } = req.query;

    if (!code) {
        res.status(400).json({ message: 'Ingen autorisationskode modtaget.' });
        return;
    }

    try {
        const tokens = await getGoogleTokens(code as string);
        const userInfo = await getUserInfo();

        if (!userInfo.email) {
            res.status(400).send({ message: 'Ingen e-mail fundet på din Google-konto.' });
            return;
        }

        const { email, id: google_id, name } = userInfo;

        let user = await iUserModel.findOne({ google_id });

        if (!user) {
            user = new iUserModel({
                name: name || 'Ukendt Bruger',
                email,
                google_id,
                refresh_token: tokens.refresh_token ?? ''
            });
        } else if (tokens.refresh_token) {
            user.refresh_token = tokens.refresh_token;
        }

        await user.save();

        res.json({ message: 'Login successful', user });
    } catch (error) {
        console.error('Fejl under Google-login:', error);
        next(error);
    }
};
 */