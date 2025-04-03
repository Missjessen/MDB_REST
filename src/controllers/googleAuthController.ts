import { Request, Response} from 'express';
import { iUserModel } from '../models/iUserModel';
import { google } from 'googleapis';
import { connect, disconnect } from '../repository/database';
import { withDatabase } from '../repository/database';



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
                const { tokens } = await client.getToken(code as string);
                client.setCredentials(tokens);
        
                const oauth2 = google.oauth2({ version: 'v2', auth: client });
                const { data } = await oauth2.userinfo.get();
        
                console.log("✅ Tokens:", tokens);
                console.log("👤 Brugerdata:", data);
        
                // Brug den nye funktion
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
        
                res.status(200).json({ message: 'Login OK', tokens, user });
            } catch (error) {
                console.error("❌ Fejl under Google callback:", error);
                res.status(500).json({ error: 'Fejl under login-processen' });
            }
            finally {
              await disconnect();
          }
        }
        
  


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

