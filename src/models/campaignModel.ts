import mongoose, { Schema, Types } from 'mongoose';
import { ICampaign } from '../interfaces/ICampaign';

const campaignSchema = new Schema<ICampaign>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sheetId: { type: String, required: true },
  name: { type: String, required: true },
  status: { type: String, enum: ['ENABLED', 'PAUSED'], required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  budget: { type: Number, default: 0 },
  advertisingChannelType: { type: String, default: 'SEARCH' },
  headlines: [{ type: String }],       // Flere overskrifter
  descriptions: [{ type: String }],    // Flere beskrivelser
  keywords: [{ type: String }],        // Flere søgeord
  createdAt: { type: Date, default: Date.now }
});

export const CampaignModel = mongoose.model<ICampaign>('Campaign', campaignSchema);