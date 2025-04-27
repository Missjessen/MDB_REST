// src/models/CampaignDefModel.ts
import { Schema, model, Document } from 'mongoose';
import { ICampaignDef } from '../interfaces/iCampaignDef';

// Kombinér nu ICampaignDef (uden “id”) med Document
export interface CampaignDefDoc extends ICampaignDef, Document {}

const CampaignDefSchema = new Schema<CampaignDefDoc>(
  {
    userId:     { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sheetId:    { type: String, required: true, index: true },
    campaignId: { type: String, required: true },        // omdøbt
    name:       { type: String, required: true },
    status:     { type: String, enum: ['ENABLED','PAUSED'], default: 'ENABLED', required: true },
    startDate:  { type: String, required: true },
    endDate:    { type: String, required: true },
    budget:     { type: Number },
    createdAt:  { type: Date, default: () => new Date() }
  },
  {
    collection: 'campaignDefs',
    versionKey: false
  }
);

// unik på sheetId+campaignId
CampaignDefSchema.index({ sheetId: 1, campaignId: 1 }, { unique: true });

export const CampaignDefModel = model<CampaignDefDoc>('CampaignDef', CampaignDefSchema);



/* // src/models/CampaignDefModel.ts
import { Schema, model, Document } from 'mongoose';
import { ICampaignDef } from '../interfaces/iCampaignDef';

export interface CampaignDefDoc extends ICampaignDef, Document {}
const CampaignDefSchema = new Schema<CampaignDefDoc>({
  userId:    { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sheetId:   { type: String, required: true, index: true },
  name:      { type: String, required: true },
  status:    { type: String, enum: ['ENABLED','PAUSED'], default: 'ENABLED', required: true },
  startDate: { type: String, required: true },
  endDate:   { type: String, required: true },
  createdAt: { type: Date,   default: () => new Date() }
}, {
  collection: 'campaignDefs',
  versionKey: false
});
CampaignDefSchema.index({ sheetId: 1, name: 1 });
export const CampaignDefModel = model<CampaignDefDoc>('CampaignDef', CampaignDefSchema);


 */