import express, { Request, Response } from 'express';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('image'), async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return; // Brug return uden `return res...` for at undgå fejlen
    }

    res.json({ imageUrl: `./img/uploads/${req.file.filename}` });
});

export default router;