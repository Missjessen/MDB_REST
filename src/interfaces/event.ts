import { User } from "./user";

export interface Event extends Document {
    
    title: string;
    date: Date;
    eventlocation: string;
    description: string;
    maxAttendees: number;
    attendees: string[];
    imageURL: string;
    createdBy: User ['id'];
}
