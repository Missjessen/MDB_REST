/* // services/sheetService.ts
import { SheetModel } from '../models/SheetModel';
import { Types } from 'mongoose';

export async function createSheetMeta(userId: string | Types.ObjectId, sheetId: string, name: string) {
  const sheet = new SheetModel({
    userId: new Types.ObjectId(userId), // sikrer ObjectId-format
    sheetId,
    name,
  });

  return await sheet.save();
} */