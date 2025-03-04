import { Router, Request, Response } from 'express';
import { createProduct, 
         getAllProducts, 
         getProductById, 
         updateProductsById,
         deleteProductsById, 
         getProductsByQuery,
       } from './controllers/productController';

import { loginUser, registerUser, verifyToken } from './controllers/authController';

import { createEvent,deleteEventById,getAllEvents,getEventById,updateEvent } from './controllers/eventController'; 



const router: Router = Router();

// get, post, put, delete (CRUD)

/**
 * API Route: GET /
 * Returns a welcome message for the MENTS API.
 */
router.get('/', (req: Request, res: Response) => {
    res.status(200).send('Welcome to the THIS API');
});

// **Tilføj auth route, så frontend kan bruge `/auth/token`**
router.post('/auth/token', loginUser);

router.post('/user/register', registerUser );
router.post('/user/login', loginUser );

router.post('/products', createProduct);
router.get('/products', getAllProducts);
router.get('/products/:id', getProductById);
router.get('/products/query/:key/:value', getProductsByQuery);
router.put('/products/:id', updateProductsById);
router.delete('/products/:id', verifyToken, deleteProductsById);


// get, post, put, delete (CRUD) for Events

router.post('/events', createEvent);
router.get('/events', getAllEvents);
router.get('/events/:id', getEventById);
router.put('/events/:id', updateEvent);
router.delete('/events/:id', deleteEventById);


export default router;
