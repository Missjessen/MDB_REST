// src/interfaces/ISheet.ts
import { Types } from 'mongoose';

export interface ISheet {
  _id:       Types.ObjectId;
  userId:    Types.ObjectId;
  sheetId:   string;        // Google Sheets ID
  name:      string;        // Dit eget navn på arket
  sheetUrl:  string;        // https://docs.google.com/…
  createdAt: Date;
  lastSynced?: Date;
}
