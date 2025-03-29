/* import { Schema, model } from "mongoose";
import { ICampaign } from "../interfaces/campaign";




// Mongoose schema definition
const campaignSchema = new Schema<ICampaign>({
  googleAdsId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  status: { type: String, required: true },
  customerId: { type: String, required: true }
});

// Model export
export const Campaign = model<ICampaign>('Campaign', campaignSchema);


 */