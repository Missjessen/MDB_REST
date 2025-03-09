import { User } from "./user";

export interface Event extends Document {
    
    title: string;
    eventDate: string;
    eventlocation: string;
    description: string;
    maxAttendees: number;
    attendees: string[];
    imageURL: string;
    createdBy: User ['id'];
}
