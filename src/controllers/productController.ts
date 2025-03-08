import { Request, Response } from 'express';
import { productModel } from '../models/productsModel';
import { connect, disconnect } from '../repository/database';


//CRUD -create, read, update, delete
/**
 * Create a new product in the database
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 */

export async function createProduct(req: Request, res: Response): Promise<void> {

    const data = req.body;
    try {
        await connect();
        const product = new productModel(data);
        const result = await product.save();

        res.status(201).send(result);
    }
    catch (error){
        res.status(500).send("Error creating . error: " + error);
    }
    finally {
        await disconnect();
    }
}

/**
 * retrieves all products from the database
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 */

export async function getAllProducts(req: Request, res: Response) {

    
    try {
        await connect();

     const result = await productModel.find({});

        res.status(200).send(result);
    }
    catch (error){
        res.status(500).send("Error retrieving products . error: " + error);
    }
    finally {
        await disconnect();
    }
}



/**
 * retrieves a products by id from the database
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 */

export async function getProductById(req: Request, res: Response) {

    
    try {
        await connect();

    const id = req.params.id;
    const result = await productModel.findById(id);

        res.status(200).send(result);
    }
    catch (error){
        res.status(500).send("Error retrieving products by id . error: " + error);
    }
    finally {
        await disconnect();
    }
}

/**
 * update  products by id from the database
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 */

export async function updateProductsById(req: Request, res: Response) {

    const id = req.params.id;

    
    try {
        await connect();

   
    const result = await productModel.findByIdAndUpdate(id, req.body) ;
    if (!result) {
        res.status(404).send("Product not found" + id);
    }
    else {
        res.status(200).send('Product updated successfully');
    }
    } catch (error) {
        res.status(500).send("Error updating products by id . error: " + error);
    } finally {
        await disconnect();
    }
}    

/**
 * update  products by id from the database
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 */

export async function deleteProductsById(req: Request, res: Response) {

    const id = req.params.id;

    
    try {
        await connect();

   
    const result = await productModel.findByIdAndDelete(id) ;
    if (!result) {
        res.status(404).send("Product not found with id =" + id);
    }
    else {
        res.status(200).send('Product deleted successfully');
    }
    } catch (error) {
        res.status(500).send("Error products not deleted by id . error: " + error);
    } finally {
        await disconnect();
    }
}  



/**
 * update  products by id from the database
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 */

export async function getProductsByQuery(req: Request, res: Response) {

    const key = req.params.key;
    const value = req.params.value;
    
    try {
        await connect();

   
    const result = await productModel.find({ [key]: { $regex: value, $options: 'i' } }) ;
   
    if (!result) {

        res.status(200).send('Product by query found');
    }

    
    } catch (error) {
        res.status(500).send("Product by query found . error: " + error);
    } finally {
        await disconnect();
    }
}   