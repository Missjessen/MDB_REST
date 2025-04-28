// src/interfaces/ICampaignDef.ts
import { Types } from 'mongoose';

export interface ICampaignDef {
  userId:     Types.ObjectId;
  sheetId:    string;
  campaignId: string;
  name:       string;
  status:     'ENABLED'|'PAUSED';
  startDate:  string;
  endDate:    string;
  budget?:    number;
  createdAt:  Date;
}




/* // src/interfaces/ICampaignDef.ts
import { Types } from 'mongoose';

export interface ICampaignDef {
  userId:    Types.ObjectId;
  sheetId:   string;
  name:      string;
  status:    'ENABLED' | 'PAUSED';
  startDate: string;  // YYYY-MM-DD
  endDate:   string;  // YYYY-MM-DD
  createdAt?: Date;
}
 */