import express, { Request, Response, Router } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { eventModel } from './models/eventModel'; // Opdateret import for eventSchema
import * as streamifier from 'streamifier';

const router: Router = express.Router();

// Cloudinary konfiguration
cloudinary.config({
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

        // Tjek om der faktisk er data i bufferen
        if (!buffer.length) {
            return res.status(400).json({ error: 'Ingen data modtaget til upload.' });
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'event-images' },
            async (error, result) => {
                if (error) {
                    console.error('❌ Cloudinary-fejl:', error);
                    return res.status(500).json({ error: 'Fejl ved upload til Cloudinary.' });
                }

                try {
                    const { title, date, eventlocation, description, maxAttendees, createdBy } = req.body;

                    // Opret nyt event med data fra request body
                    const newEvent = await eventModel.create({
                        title: title || "Ukendt Event",
                        date: date || new Date(),
                        eventlocation: eventlocation || "Ukendt Sted",
                        description: description || "Ingen beskrivelse angivet",
                        maxAttendees: maxAttendees || 100,
                        imageURL: result?.secure_url,
                        createdBy: createdBy || "ukendt-bruger"
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
