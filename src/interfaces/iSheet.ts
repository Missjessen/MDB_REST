// interfaces/ISheet.ts
import { Document } from 'mongoose';

export interface ISheet extends Document {
  userId: import('mongoose').Types.ObjectId;
  sheetId: string;
  name: string;
  createdAt: Date;
}