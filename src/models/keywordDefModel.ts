// src/models/KeywordDefModel.ts
import { Schema, model, Document } from 'mongoose';
import { IKeywordDef } from '../interfaces/IKeywordDef';

export interface KeywordDefDoc extends Document, Omit<IKeywordDef,'_id'> {}

const KeywordDefSchema = new Schema<KeywordDefDoc>({
  userId:    { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sheetId:   { type: String, required: true, index: true },
  adGroup:   { type: String, required: true },
  keyword:   { type: String, required: true },
  matchType: { type: String, enum: ['BROAD','PHRASE','EXACT'], required: true },
  cpc:       { type: Number },
  createdAt: { type: Date, default: () => new Date() }
}, {
  collection: 'keywordDefs',
  versionKey: false
});

KeywordDefSchema.index({ sheetId: 1, adGroup: 1 });

export const KeywordDefModel = model<KeywordDefDoc>('KeywordDef', KeywordDefSchema);
