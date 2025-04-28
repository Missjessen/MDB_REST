// src/models/AdDefModel.ts
import { Schema, model, Document } from 'mongoose';
import { IAdDef } from '../interfaces/IAdDef';

// Omit<IAdDef,'_id'> fjerner _id fra dit interface,
// så Document kun kommer med den én gang.
export interface AdDefDoc extends Document, Omit<IAdDef,'_id'> {}

const AdDefSchema = new Schema<AdDefDoc>({
  userId:      { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sheetId:     { type: String, required: true, index: true },
  adGroup:     { type: String, required: true },
  headline1:   { type: String, required: true },
  headline2:   { type: String },
  description: { type: String, required: true },
  finalUrl:    { type: String, required: true },
  path1:       { type: String },
  path2:       { type: String },
  createdAt:   { type: Date, default: () => new Date() }
}, {
  collection: 'adDefs',
  versionKey: false
});

AdDefSchema.index({ sheetId: 1, adGroup: 1 });

export const AdDefModel = model<AdDefDoc>('AdDef', AdDefSchema);
