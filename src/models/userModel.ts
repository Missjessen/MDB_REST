//import { required } from "joi/lib";
import { Schema, model } from "mongoose";
import { User } from "../interfaces/user";

const userSchema = new Schema<User>({
    name: { type: String, required: true, minlength: 3, maxlength: 255 },
    email: { type: String, required: true, unique: true, minlength: 6, maxlength: 255 },
    password: { type: String, required: true, minlength: 6, maxlength: 255 },
    createdAt: { type: Date, default: Date.now }
   
});

export const userModel = model<User>('User', userSchema);
