import { User } from "./user";

export interface Product extends Document {
    name: string;
    description: string;
    imageURL: string; 
    price: number;
    stock: number;
    isONdiscount: boolean;
    discountPct: number;
    isHidden: boolean;
    _createdBy: User ['id'];
    
}