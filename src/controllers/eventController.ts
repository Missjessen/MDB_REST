import { Request, Response } from 'express';
import { eventModel } from '../models/eventModel';
import { connect, disconnect } from '../repository/database';

//CRUD -create, read, update, delete


/**
 * Create a new event in the database
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 */

/* export async function createEvent(req: Request, res: Response): Promise<void> {

    const data = req.body;
    try {
        await connect();
        const event = new eventModel(data);
        const result = await event.save();

        res.status(201).send(result);
    }
    catch (error){
        res.status(500).send("Error creating . error: " + error);
    }
    finally {
        await disconnect();
    }
} */

export async function createEvent(req: Request, res: Response): Promise<void> {
    const eventData = req.body; // Ændret fra "event" til "eventData"
    try {
        await connect();
        const newEvent = new eventModel(eventData); // Brug "newEvent" i stedet
        const result = await newEvent.save();
        res.status(201).send(result);
    }
    catch (error) {
        res.status(500).send("Error creating event. Error: " + error);
    }
    finally {
        await disconnect();
    }
}

/**
 * retrieves all events from the database
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 */

export async function getAllEvents(req: Request, res: Response) {

    
    try {
        await connect();

     const result = await eventModel.find({});

        res.status(200).send(result);
    }
    catch (error){
        res.status(500).send("Error retrieving events . error: " + error);
    }
    finally {
        await disconnect();
    }
}



/**
 * retrieves a event by id from the database
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 */

export async function getEventById(req: Request, res: Response) {

    
    try {
        await connect();
        const result = await
        eventModel.findById(req.params.id);
        res.status(200).send(result);
    }
    catch (error){
        res.status(500).send("Error retrieving event . error: " + error);
    }
    finally {
        await disconnect();
    }
}


// /* /**
//  * Update a event in the database
//  * @param {Request} req - The request object
//  * @param {Response} res - The response object
//  */

// export async function updateEvent(req: Request, res: Response) {
//     try {
//         await connect();
//         const result = await eventModel.findByIdAndUpdate(req.params.id, req.body);
//         res.status(200).send(result);
//     }
//     catch (error){
//         res.status(500).send("Error updating event . error: " + error);
//     }
//     finally {
//         await disconnect();
//     }
// } */

/**
 * Update a specific event in the database
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 */
export async function updateEvent(req: Request, res: Response): Promise<void>   {
    try {
        await connect();

        // Find eksisterende event
        const existingEvent = await eventModel.findById(req.params.id);


        if (!existingEvent) {
            res.status(404).send({ message: "Event not found" });
            return;
        }



        // Opdater event med de nye data
        const updatedEvent = await eventModel.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },   // $set sikrer kun de felter, der ændres
            { new: true, runValidators: true } // Returnér den opdaterede version og valider data
        );

        res.status(200).send({
            message: "Event updated successfully",
            updatedEvent
        });
    } 
    catch (error) {
        res.status(500).send("Error Event not updated by id . error: " + error);
    } 
    finally {
        await disconnect();
    }
}

/**
 * Delete a event in the database
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 */



export async function deleteEventById(req: Request, res: Response) {

    const id = req.params.id;

    
    try {
        await connect();

   
    const result = await eventModel.findByIdAndDelete(id) ;
    if (!result) {
        res.status(404).send("event delete with id =" + id);
    }
    else {
        res.status(200).send('Event deleted successfully');
    }
    } catch (error) {
        res.status(500).send("Error Event not deleted by id . error: " + error);
    } finally {
        await disconnect();
    }
}  