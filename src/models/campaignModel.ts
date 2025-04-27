/* import { Schema, model, Types, Document } from 'mongoose';
import { ICampaign } from '../interfaces/ICampaign';

// Kombinerer ICampaign med mongoose.Document for at få alle Document‑metoder
export interface CampaignDocument extends ICampaign, Document {}

// Selve schema‑definitionen
const campaignSchema = new Schema<CampaignDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    sheetId: {
      type: String,
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['ENABLED', 'PAUSED'],
      default: 'ENABLED',
      required: true
    },
    startDate: {
      type: String,
      required: true
    },
    endDate: {
      type: String,
      required: true
    },
    budget: {
      type: Number
    },
    advertisingChannelType: {
      type: String
    },
    headlines: {
      type: [String]
    },
    descriptions: {
      type: [String]
    },
    keywords: {
      type: [String]
    }
  },
  {
    collection: 'campaignDefs',
    versionKey: false,
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
  }
);

// Index for at slå op pr. sheetId og navne hurtigt
campaignSchema.index({ sheetId: 1, name: 1 });

export const CampaignModel = model<CampaignDocument>(
  'CampaignDef',
  campaignSchema
);
 */