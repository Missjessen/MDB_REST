import { Router, Request, Response } from 'express';

const router: Router = Router();

// get, post, put, delete (CRUD)

/**
 * API Route: GET /
 * Returns a welcome message for the MENTS API.
 */
router.get('/', (req: Request, res: Response) => {
    res.status(200).send('Welcome to the THIS API');
});

export default router;
