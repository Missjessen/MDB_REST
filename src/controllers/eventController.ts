import { Request, Response } from 'express';
import { eventModel } from '../models/eventModel';
import { connect, disconnect } from '../repository/database';

// ░▒▓██ get, post, put, delete (CRUD)██▓▒░

// ======================== CREATE EVENT ========================
/**
 * Create a new event in the database
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 */
export async function createEvent(req: Request, res: Response): Promise<void> {
    const eventData = req.body; // Ændret fra "event" til "eventData"
    try {
/*
        const testData = {
            
                "title": "Vue.js Meetup",
                "date": "2025-03-15T18:00:00.000Z",
                "eventlocation": "Copenhagen, Denmark",
                "description": "Lær om Vue.js og mød andre udviklere!",
                "maxAttendees": 50,
                "attendees": [],
                "createdBy": "user123"
              
        }
*/

        console.log(eventData);
        await connect();
        const newEvent = new eventModel(eventData); // Brug "newEvent" i stedet
        
        const result = await newEvent.save();

        res.status(201).json({ result });
    }
    catch (error) {
        //console.log(error)
        res.status(500).json({ error: "Error creating event. Error: " + error });
    }
    finally {
        await disconnect();
    }
}

// ======================== GET ALL EVENTS ========================
/**
 * Retrieves all events from the database
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



// ======================== GET EVENT BY ID ========================
/**
 * Retrieves an event by ID from the database
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


// ======================== UPDATE EVENT ========================
/**
 * Update an event in the database
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 */
export async function updateEvent(req: Request, res: Response) {
    try {
        await connect();
        const result = await eventModel.findByIdAndUpdate(req.params.id, req.body);
        res.status(200).send(result);
    }
    catch (error){
        res.status(500).send("Error updating event . error: " + error);
    }
    finally {
        await disconnect();
    }
}


// ======================== DELETE EVENT ========================
/**
 * Delete an event in the database
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