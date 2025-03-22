import { Request, Response, NextFunction } from 'express';
import { generateAuthUrl, getGoogleTokens, getUserInfo } from '../services/googleAuthService';
import { iUserModel } from '../models/iUserModel';

export const googleLogin = (req: Request, res: Response): void => {
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
