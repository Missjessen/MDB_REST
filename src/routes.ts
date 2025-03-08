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


// ░▒▓██ get, post, put, delete (CRUD)██▓▒░

/* 
█████████████████████████████████████████████████                                           
█          🌐 API ROUTES CONFIGURATION          █                                            
█████████████████████████████████████████████████
*/
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
/* 
// **Tilføj auth route, så frontend kan bruge `/auth/token`**
router.post('/auth/token', loginUser); */

/* 
█████████████████████████████████████████████████
█             🔐 AUTHENTICATION ROUTES          █
█████████████████████████████████████████████████
*/
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


/**
 * @swagger
 * /user/login:
 *   post:
 *     tags:
 *       - User Routes
 *     summary: Login an existing user
 *     description: Logs in an existing user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in succesfully
 *         content:
 *           application/json:
 *             schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 */
router.post('/user/login', loginUser );


/*
█████████████████████████████████████████████████
█           🛍️ PRODUCT ROUTES (CRUD)          █
█████████████████████████████████████████████████
|--------------------------------------------------------------------------
| Product Routes - CRUD API
|--------------------------------------------------------------------------
| CRUD Endpoints:
| 1. POST /product - Opret et nyt event (kræver authentication)
| 2. GET /product - Hent alle produkter
| 3. GET /product/:id - Hent et specifikt event via ID
| 4. GET /product/:id - Hent et specifikt product Query
| 5. PUT /product/:id - Opdater et event via ID (kræver authentication)
| 6. DELETE /product/:id - Slet et event via ID (kræver authentication)
|--------------------------------------------------------------------------
*/

// ========= 2. Create Product =========
router.post('/products', createProduct);

// ========= 3. Get all Product =========
router.get('/products', getAllProducts);

// ========= 4. Get Product by id =========
router.get('/products/:id', getProductById);

// ========= 5. Get Products By Query =========
router.get('/products/query/:key/:value', getProductsByQuery);

// ========= 6. Update Products By Id) =========
/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     tags:
 *       - Product Routes
 *     summary: Delete a specific product
 *     description: Deletes a specific product from the database based on its ID.
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

// ========= 6. Update Products By Id) =========


/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     tags:
 *       - Product Routes
 *     summary: Delete a specific Product
 *     description: Deletes a specific Product based on its ID
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique ID of the product to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       401:
 *         description: Access Denied
 *       404:
 *         description: Product not found with the given ID
 *       500:
 *         description: Internal Server Error - Product deletion failed
 */
router.delete('/products/:id', verifyToken, deleteProductsById);


/* 
█████████████████████████████████████████████████
█             🎟️ EVENT ROUTES (CRUD)           █
█████████████████████████████████████████████████
|--------------------------------------------------------------------------
| Event Routes - CRUD API
|--------------------------------------------------------------------------
| CRUD Endpoints:
| 1. POST /events - Opret et nyt event (kræver authentication)
| 2. GET /events - Hent alle events
| 3. GET /events/:id - Hent et specifikt event via ID
| 4. PUT /events/:id - Opdater et event via ID (kræver authentication)
| 5. DELETE /events/:id - Slet et event via ID (kræver authentication)
| 6. DELETE /events/:id - Slet et event via ID (kræver authentication)
|--------------------------------------------------------------------------
*/

// ========= 1. CreateEvent =========
/**
 * @swagger
 * /events:
 *   post:
 *     tags:
 *       - Event Routes
 *     summary: Create a new Event
 *     description: Creates a new event and stores it in the database.
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Event"
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Event"
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized - Missing or invalid token
 */
router.post('/events', verifyToken, createEvent);


// ========= 2. GetAllEvents =========
/**
 * @swagger
 * /events:
 *   get:
 *     tags:
 *       - Event Routes
 *     summary: Get all Events
 *     description: Retrieves a list of all events.
 *     responses:
 *       200:
 *         description: List of events retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Event" 
 *         500: 
             description: Internal server error
 *      
 *        
 */
router.get('/events', getAllEvents);

// ========= 3. GetEventById =========
/**
 * @swagger
 * /events/{id}:
 *   get:
 *     tags:
 *       - Event Routes
 *     summary: Get a specific Event
 *     description: Retrieves details of a specific event based on its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique ID of the event
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Event"
 *       404:
 *         description: Event not found
 *      500:
 *        description: Internal server error
 */
router.get('/events/:id', getEventById);


// ========= 4. UpdateEvent =========
/**
 * @swagger
 * /events/{id}:
 *   put:
 *     tags:
 *       - Event Routes
 *     summary: Update a specific Event
 *     description: Updates the details of a specific event based on its ID.
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique ID of the event
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             title: "Sample Event Title"
 *             description: "This is a sample event description"
 *             date: "2025-03-07T10:40:36.851Z"
 *             eventlocation: "Sample Location"
 *             maxAttendees: 100
 *             attendees: ["John Doe", "Jane Doe"]
 *             imageURL: "https://example.com/sample-image.jpg"
 *             createdBy: "admin"
 *     responses:
 *       200:
 *         description: Event updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Event updated successfully"
 *               updatedEvent:
 *                 title: "Sample Event Title"
 *                 description: "Updated description"
 *                 date: "2025-03-07T10:40:36.851Z"
 *                 eventlocation: "Updated Location"
 *                 maxAttendees: 200
 *                 attendees: ["Alice", "Bob"]
 *                 imageURL: "https://example.com/updated-image.jpg"
 *                 createdBy: "admin"
 *       404:
 *         description: Event not found
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Server error
 */
router.put('/events/:id', verifyToken, updateEvent);


// ========= 5. DeleteEventById =========
/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     tags:
 *       - Event Routes
 *     summary: Delete a specific Event
 *     description: Deletes a specific event from the database based on its ID.
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique ID of the event
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: Event not found
 */
router.delete('/events/:id', verifyToken, deleteEventById);





export default router;
