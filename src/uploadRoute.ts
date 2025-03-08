import express, { Request, Response, Router } from 'express';
import cloudinary from 'cloudinary';
import { eventModel } from './models/eventModel'; // Opdateret import for eventSchema
import * as streamifier from 'streamifier';

const router: Router = express.Router();

// Cloudinary konfiguration
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 🔼 FILUPLOAD TIL CLOUDINARY OG GEM I EVENTSCHEMA 🔼
router.post('/upload', async (req: Request, res: Response) => {
    const chunks: Buffer[] = [];

    req.on('data', (chunk) => {
        chunks.push(chunk);
    });

    req.on('end', async () => {
        const buffer = Buffer.concat(chunks);

        const uploadStream = cloudinary.v2.uploader.upload_stream(
            { folder: 'event-images' },
            async (error, result) => {
                if (error) {
                    console.error('❌ Cloudinary-fejl:', error);
                    return res.status(500).json({ error: 'Fejl ved upload til Cloudinary.' });
                }

                try {
                    // Opret nyt event og gem imageURL
                    const newEvent = await eventModel.create({
                        title: "Eksempel Event",
                        date: new Date(),
                        eventlocation: "Eksempel Sted",
                        description: "Dette er et testevent",
                        maxAttendees: 100,
                        imageURL: result?.secure_url,
                        createdBy: "user123"  // Erstat evt. med dynamisk ID fra brugerens login
                    });

                    res.json({
                        message: '✅ Event oprettet med billede!',
                        eventId: newEvent._id,
                        imageURL: newEvent.imageURL
                    });
                } catch (dbError) {
                    console.error('❌ Fejl ved oprettelse af event:', dbError);
                    res.status(500).json({ error: 'Fejl ved gemning i MongoDB.' });
                }
            }
        );

        streamifier.createReadStream(buffer).pipe(uploadStream);
    });

    req.on('error', (err) => {
        console.error('❌ Fejl ved modtagelse af data:', err);
        res.status(500).json({ error: 'Fejl ved upload.' });
    });
});

export default router;
