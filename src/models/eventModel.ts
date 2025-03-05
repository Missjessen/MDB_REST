import { Schema, model } from "mongoose";
import { Event } from "../interfaces/event";

const eventSchema = new Schema<Event>({
    title: { type: String, required: true, min: 6, max: 255 },
    date: { type: Date, required: true },
    eventlocation: { type: String, required: true, min: 6, max: 255 },
    description: { type: String, required: false, min: 6, max: 1024 },
    maxAttendees: { type: Number, required: true },
    attendees: { type: [String], required: false },
    imageURL: { type: String, required: false },
    createdBy: { type: String, ref: 'User', required: true }
});

type UpdateQuery<T> = {
    [key: string]: any;
} & {
    __v?: number;
    $set?: Partial<T> & { __v?: number };
    $setOnInsert?: Partial<T> & { __v?: number };
    $inc?: { __v?: number };
};

eventSchema.pre('findOneAndUpdate', function <T extends Document>(this: any) {
    const update = this.getUpdate() as UpdateQuery<T>;
    if (update.__v != null) {
        delete update.__v;
    }
    const keys: Array<'$set' | '$setOnInsert'> = ['$set', '$setOnInsert'];
    for (const key of keys) {
        if (update[key] != null && update[key]!.__v != null) {
            delete update[key]!.__v;
            if (Object.keys(update[key]!).length === 0) {
                delete update[key];
            }
        }
    }
    update.$inc = update.$inc || {};
    update.$inc.__v = 1;
});

export const eventModel = model<Event>('Event', eventSchema);