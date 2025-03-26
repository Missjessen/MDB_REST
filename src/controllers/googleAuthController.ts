import { Request, Response, NextFunction } from 'express';
// import { generateAuthUrl, getGoogleTokens, getUserInfo } from '../services/googleAuthService';
import { iUserModel } from '../models/iUserModel';
import { OAuth2Client } from 'google-auth-library';


const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

// ➤ 1. Login Endpoint - Omdiriger til Googles OAuth 2.0-side
export async function googleLogin(req: Request, res: Response) {
    const url = `https://accounts.google.com/o/oauth2/auth?` +
        `client_id=${process.env.GOOGLE_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(process.env.GOOGLE_REDIRECT_URI as string)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent('https://www.googleapis.com/auth/adwords https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile')}` +
        `&access_type=offline` +
        `&prompt=consent`;

    console.log("✅ OAuth URL:", url);
    res.redirect(url);
}
/* export async function googleLogin(req: Request, res: Response) {
    const url = client.generateAuthUrl({
        access_type: 'offline',    // 🔥 Sikrer refresh_token
        prompt: 'consent',         // 🔥 Tvinger brugeren til at bekræfte hver gang
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

export async function googleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { code } = req.query;

    if (!code) {
        console.error('❌ Ingen kode modtaget fra Google');
        res.status(400).json({ error: 'Fejl: Ingen kode modtaget.' });
        return;
    }

    try {
        const { tokens } = await client.getToken(code as string);

        if (!tokens || !tokens.access_token) {
            console.error('❌ Token-udveksling mislykkedes');
            res.status(500).json({ error: 'Token-udveksling mislykkedes' });
            return;
        }

        const userData = {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiryDate: tokens.expiry_date
        };

        console.log('✅ Tokens modtaget:', userData);
        res.status(200).json({ message: 'Login succesfuldt', userData });

    } catch (error) {
        console.error("❌ Fejl ved token-udveksling:", error);
        next(error);  // Videresend fejlen til din error-handler
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