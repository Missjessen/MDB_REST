// src/interfaces/IAdDef.ts
import { Types } from 'mongoose';
export interface IAdDef {
  userId:    Types.ObjectId;
  sheetId:   string;    // Google Sheets ID
  adGroup:   string;
  headline1: string;
  headline2?:string;
  description:string;
  finalUrl:  string;
  path1?:    string;
  path2?:    string;
  createdAt?: Date;
}