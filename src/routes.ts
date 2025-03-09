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
/**
 * @swagger
 * /products:
 *   post:
 *     tags:
 *       - Product Routes
 *     summary: Create a new Product
 *     description: Create a new Product
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Product"
 *           example:
 *             name: "Mr. Burns statue"
 *             description: "The best and precious statue ever"
 *             imageURL: "https://picsum.photos/500/500"
 *             price: 10000.96
 *             stock: 3
 *             discount: false
 *             discountPct: 0
 *             isHidden: false
 *             _createdBy: "6748771972ba527f3a17a313"
 *     responses:
 *       201:
 *         description: Product created succesfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Product"
 */
router.post('/products', createProduct);

// ========= 3. Get all Product =========
/**
 * @swagger
 * /products:
 *   get:
 *     tags:
 *       - Product Routes
 *     summary: Retrieves a list of Products
 *     description: Retrieves a list of products as JSON objects.
 *     responses:
 *       200:
 *         description: A list of product JSON objects in an array.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Product"
 */
router.get('/products', getAllProducts);

// ========= 4. Get Product by id =========
router.get('/products/:id', getProductById);

// ========= 5. Get Products By Query =========
/**
 * @swagger
 * /products/query/{field}/{value}:
 *   get:
 *     tags:
 *       - Product Routes
 *     summary: Retrieves all Products based on a specified query
 *     description:
 *     parameters:
 *       - in: path
 *         name: field
 *         required: true
 *         description: The field we want to query
 *         schema:
 *           type: string
 *       - in: path
 *         name: value
 *         required: true
 *         description: The value of the field
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of Product JSON objects in an array.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Product"
 */
router.get('/products/query/:key/:value', getProductsByQuery);

// ========= 6. Update Products By Id) =========
/**
 * @swagger
 * /products/{id}:
 *   put:
 *     tags:
 *       - Product Routes
 *     summary: Updates a specific Product
 *     description: Updates a specific Product based on it id
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: MongoDB id
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Product"
 *
 *     responses:
 *       201:
 *         description: Product updated succesfully
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
 *     summary: Deletes a specific Product
 *     description: Deletes a specific Product based on it id
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: MongoDB id
 *         schema:
 *           type: string
 *
 *     responses:
 *       201:
 *         description: Product deleted succesfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Product"
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
 *          description: Internal server error
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
 *                 eventDate: "2025-03-07T10:40:36.851Z"
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
