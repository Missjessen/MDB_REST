import { Types } from 'mongoose';

export interface ICampaign {
  userId: Types.ObjectId;
  sheetId: string;
  name: string;
  status: 'ENABLED' | 'PAUSED';
  startDate: string;
  endDate: string;
  budget?: number;
  advertisingChannelType?: string;
  headlines?: string[];
  descriptions?: string[];
  keywords?: string[];
  createdAt?: Date;
}
