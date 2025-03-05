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
 * @swagger
 * /:
 *   get:
 *     tags: 
 *       - app routes
 *     summary: Welcome to the MENTS API
 *     description: Returns a welcome message for the MENTS API.
 *     responses:
 *       200:
 *         description: A welcome message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Welcome to the MENTS API
 */
router.get('/', (req: Request, res: Response) => {
    res.status(200).send('Welcome to the THIS API');
});

// **Tilføj auth route, så frontend kan bruge `/auth/token`**
router.post('/auth/token', loginUser);

/**
 * @swagger
 * /user/register:
 *   post:
 *     tags:
 *       - User Routes
 *     summary: Register a new user
 *     description: Takes a user in the body and tries to register it in the database
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/User"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 _id:
 *                   type: string
 */
router.post('/user/register', registerUser );

router.post('/user/login', loginUser );

router.post('/products', createProduct);
router.get('/products', getAllProducts);
router.get('/products/:id', getProductById);
router.get('/products/query/:key/:value', getProductsByQuery);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     tags:
 *       - Product Routes
 *     summary: Updates a specific Product
 *     description: Updates a specific Product based on its ID
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID from repository
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Product"
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Product"
 */
router.put('/products/:id', verifyToken, updateProductsById);

router.delete('/products/:id', verifyToken, deleteProductsById);


// get, post, put, delete (CRUD) for Events

router.post('/events', createEvent);
router.get('/events', getAllEvents);
router.get('/events/:id', getEventById);
router.put('/events/:id', updateEvent);
router.delete('/events/:id', deleteEventById);


export default router;
