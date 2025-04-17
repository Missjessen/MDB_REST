/* import mongoose, { Schema, Types } from 'mongoose';
import { ISheet } from '../interfaces/ISheet';

const sheetSchema = new Schema<ISheet>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sheetId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const SheetModel = mongoose.model<ISheet>('Sheet', sheetSchema);
 */