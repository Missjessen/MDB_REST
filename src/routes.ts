import { Router, Request, Response } from 'express';
// import { createProduct, 
//          getAllProducts, 
//          getProductById, 
//          updateProductsById,
//          deleteProductsById, 
//          getProductsByQuery,
//        } from './controllers/productController';
import { startCron } from './controllers/devToolsController';

import { loginUser, registerUser, verifyToken } from './controllers/authController';

//import { createEvent,deleteEventById,getAllEvents,getEventById,updateEvent } from './controllers/eventController'; 



const router: Router = Router();

/* 
█████████████████████████████████████████████████                                           
█          🌐 Render alive                      █                                            
█████████████████████████████████████████████████
*/
//router.get('/ping', startCron);
/**
 * @swagger
 * /start-cron:
 *   get:
 *     tags:
 *       - Start Cron Jobs
 *     summary: Starts the cron job that keep render alive
 *     description: Starts the cron job that keep render alive
 *     responses:
 *       200:
 *         description: Response from the cron job
 *         content:
 *           application/json:
 *             schema:
 *               type: array               
 */
router.get('/start-cron', startCron);


// ░▒▓██ get, post, put, delete (CRUD)██▓▒░

/* 
█████████████████████████████████████████████████                                           
█          🌐 API ROUTES CONFIGURATION          █                                            
█████████████████████████████████████████████████
*/


router.get('/', (req: Request, res: Response) => {
    res.status(200).send({message:'Welcome to the THIS API'});
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
 *     summary: Register a new user
 *     description: Takes a user in the body and tries to register it in the database
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/User"
 *           example:
 *             name: "homer_simpson"
 *             email: "homer.simpson@springfield.com"
 *             password: "donuts4life"
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
 *                 example: "homer@springfield.com"
 *               password:
 *                 type: string
 *                 example: "DonutLover123"
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid email or password"
 */
router.post('/user/login', loginUser );



// /*
// █████████████████████████████████████████████████
// █           🛍️ PRODUCT ROUTES (CRUD)          █
// █████████████████████████████████████████████████
// |--------------------------------------------------------------------------
// | Product Routes - CRUD API
// |--------------------------------------------------------------------------
// | CRUD Endpoints:
// | 1. POST /product - Opret et nyt event (kræver authentication)
// | 2. GET /product - Hent alle produkter
// | 3. GET /product/:id - Hent et specifikt event via ID
// | 4. GET /product/:id - Hent et specifikt product Query
// | 5. PUT /product/:id - Opdater et event via ID (kræver authentication)
// | 6. DELETE /product/:id - Slet et event via ID (kræver authentication)
// |--------------------------------------------------------------------------
// */

// // ========= 2. Create Product =========
// /**
//  * @swagger
//  * /products:
//  *   post:
//  *     summary: Create a new Product
//  *     description: Create a new Product
//  *     security:
//  *       - ApiKeyAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: "#/components/schemas/Product"
//  *           example:
//  *             name: "Mr. Burns statue"
//  *             description: "The best and precious statue ever"
//  *             imageURL: "https://picsum.photos/500/500"
//  *             price: 10000.96
//  *             stock: 3
//  *             discount: false
//  *             discountPct: 0
//  *             isHidden: false
//  *             _createdBy: "6748771972ba527f3a17a313"
//  *     responses:
//  *       201:
//  *         description: Product created succesfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: "#/components/schemas/Product"
//  */
// router.post('/products', createProduct);

// // ========= 3. Get all Product =========
// /**
//  * @swagger
//  * /products:
//  *   get:
//  *     summary: Retrieves a list of Products
//  *     description: Retrieves a list of products as JSON objects.
//  *     responses:
//  *       200:
//  *         description: A list of product JSON objects in an array.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: array
//  *               items:
//  *                 $ref: "#/components/schemas/Product"
//  */
// router.get('/products', getAllProducts);

// // ========= 4. Get Product by id =========
// router.get('/products/:id', getProductById);

// // ========= 5. Get Products By Query =========
// /**
//  * @swagger
//  * /products/query/{field}/{value}:
//  *   get:
//  *     summary: Retrieves all Products based on a specified query
//  *     description:
//  *     parameters:
//  *       - in: path
//  *         name: field
//  *         required: true
//  *         description: The field we want to query
//  *         schema:
//  *           type: string
//  *       - in: path
//  *         name: value
//  *         required: true
//  *         description: The value of the field
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: A list of Product JSON objects in an array.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: array
//  *               items:
//  *                 $ref: "#/components/schemas/Product"
//  */
// router.get('/products/query/:key/:value', getProductsByQuery);

// // ========= 6. Update Products By Id) =========
// /**
//  * @swagger
//  * /products/{id}:
//  *   put:
//  *     summary: Updates a specific Product
//  *     description: Updates a specific Product based on it id
//  *     security:
//  *       - ApiKeyAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         description: MongoDB id
//  *         schema:
//  *           type: string
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: "#/components/schemas/Product"
//  *
//  *     responses:
//  *       201:
//  *         description: Product updated succesfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: "#/components/schemas/Product"
//  */
// router.put('/products/:id', verifyToken, updateProductsById);

// // ========= 6. Update Products By Id) =========
// /**
//  * @swagger
//  * /products/{id}:
//  *   delete:
//  *     summary: Deletes a specific Product
//  *     description: Deletes a specific Product based on it id
//  *     security:
//  *       - ApiKeyAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         description: MongoDB id
//  *         schema:
//  *           type: string
//  *
//  *     responses:
//  *       201:
//  *         description: Product deleted succesfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: "#/components/schemas/Product"
//  */
// router.delete('/products/:id', verifyToken, deleteProductsById);


// /* 
// █████████████████████████████████████████████████
// █             🎟️ EVENT ROUTES (CRUD)           █
// █████████████████████████████████████████████████
// |--------------------------------------------------------------------------
// | Event Routes - CRUD API
// |--------------------------------------------------------------------------
// | CRUD Endpoints:
// | 1. POST /events - Opret et nyt event (kræver authentication)
// | 2. GET /events - Hent alle events
// | 3. GET /events/:id - Hent et specifikt event via ID
// | 4. PUT /events/:id - Opdater et event via ID (kræver authentication)
// | 5. DELETE /events/:id - Slet et event via ID (kræver authentication)
// | 6. DELETE /events/:id - Slet et event via ID (kræver authentication)
// |--------------------------------------------------------------------------
// */

// // ========= 1. CreateEvent =========
// /**
//  * @swagger
//  * /events:
//  *   post:
//  *     summary: Create a new Event
//  *     description: Creates a new event and stores it in the database.
//  *     security:
//  *       - ApiKeyAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: "#/components/schemas/Event"
//  *           example:
//  *             title: "Mr. Burns statue unveiling"
//  *             date: "2025-10-10T12:00:00"
//  *             eventlocation: "Springfield Town Hall"
//  *             description: "Unveiling of the finest statue of Mr. Burns"
//  *             maxAttendees: 200
//  *             attendees: []
//  *             imageURL: "https://picsum.photos/500/500"
//  *             createdBy: "6748771972ba527f3a17a313"
//  *     responses:
//  *       201:
//  *         description: Event created successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: "#/components/schemas/Event"
//  *       400:
//  *         description: Invalid request body
//  *       401:
//  *         description: Unauthorized - Missing or invalid token
//  */
// router.post('/events', verifyToken, createEvent);


// // ========= 2. GetAllEvents =========
// /**
//  * @swagger
//  * /events:
//  *   get:
//  *     summary: Get all Events
//  *     description: Retrieves a list of all events.
//  *     responses:
//  *       200:
//  *         description: List of events retrieved successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: array
//  *               items:
//  *                 $ref: "#/components/schemas/Event" 
//  *         500: 
//  *          description: Internal server error
//  *      
//  *        
//  */
// router.get('/events', getAllEvents);

// // ========= 3. GetEventById =========
// /**
//  * @swagger
//  * /events/{id}:
//  *   get:
//  *     summary: Retrieve an Event by ID
//  *     description: Retrieves detailed information about a specific event using its unique identifier.
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         description: The unique identifier (ObjectId) of the event to retrieve.
//  *         schema:
//  *           type: string
//  *           example: "67c399a06023098382da63b5"
//  *     responses:
//  *       200:
//  *         description: Event retrieved successfully.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: "#/components/schemas/Event"
//  *             example:
//  *               _id: "67c399a06023098382da63b5"
//  *               title: "Homers Chili Challenge"
//  *               date: "2025-09-20T13:00:00.000Z"
//  *               eventlocation: "Springfield Bytorv"
//  *               description: "Kan du klare Homers super-hot chili? Test dine smagsløg!"
//  *               maxAttendees: 75
//  *               attendees:
//  *                 - "user123"
//  *                 - "user456"
//  *               imageURL: "https://picsum.photos/500/500"
//  *               createdBy: "user222"
//  *       400:
//  *         description: Bad Request - Invalid ID format.
//  *       404:
//  *         description: Event not found with the specified ID.
//  *       500:
//  *         description: Internal Server Error - Something went wrong on the server.
//  */
// router.get('/events/:id', getEventById);


// // ========= 4. UpdateEvent =========
// /**
//  * @swagger
//  * /events/{id}:
//  *   put:
//  *     summary: Update an Event by ID
//  *     description: Updates the details of a specific event identified by its ID.
//  *     security:
//  *       - ApiKeyAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         description: Unique ID of the event to update.
//  *         schema:
//  *           type: string
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: "#/components/schemas/Event"
//  *           example:
//  *             title: "Homers Chili Challenge"
//  *             date: "2025-09-20T13:00:00"
//  *             eventlocation: "Springfield Bytorv"
//  *             description: "Kan du klare Homers super-hot chili? Test dine smagsløg!"
//  *             maxAttendees: 100
//  *             attendees: ["user123", "user456"]
//  *             imageURL: "https://example.com/image.jpg"
//  *             createdBy: "6748771972ba527f3a17a313"
//  *     responses:
//  *       200:
//  *         description: Event updated successfully.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: "#/components/schemas/Event"
//  *       400:
//  *         description: Invalid request body.
//  *       401:
//  *         description: Unauthorized - Token is invalid or missing.
//  *       404:
//  *         description: Event not found.
//  *       500:
//  *         description: Internal Server Error - Something went wrong on the server.
//  */
// router.put('/events/:id', verifyToken, updateEvent);


// // ========= 5. DeleteEventById =========
// /**
//  * @swagger
//  * /events/{id}:
//  *   delete:
//  *     summary: Delete a specific Event
//  *     description: Deletes a specific event from the database based on its ID.
//  *     security:
//  *       - ApiKeyAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         description: Unique ID of the event
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Event deleted successfully
//  *       401:
//  *         description: Unauthorized - Missing or invalid token
//  *       404:
//  *         description: Event not found
//  */
// router.delete('/events/:id', verifyToken, deleteEventById);






export default router;
