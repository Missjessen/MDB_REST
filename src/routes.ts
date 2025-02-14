import { Router, Request, Response } from 'express';
import { createProduct, 
         getAllProducts, 
         getProductById, 
         updateProductsById,
         deleteProductsById } from './controllers/productController';


const router: Router = Router();

// get, post, put, delete (CRUD)

/**
 * API Route: GET /
 * Returns a welcome message for the MENTS API.
 */
router.get('/', (req: Request, res: Response) => {
    res.status(200).send('Welcome to the THIS API');
});

router.post('/products', createProduct);
router.get('/products', getAllProducts);
router.get('/products/:id', getProductById);
router.put('/products/:id', updateProductsById);
router.delete('/products/:id', deleteProductsById);


export default router;
