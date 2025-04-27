// src/interfaces/iCampaignDef.ts
import { Types } from 'mongoose';

export interface ICampaignDef {
  userId:      Types.ObjectId;
  sheetId:     string;      // Google Sheets ID
  campaignId:  string;      // i stedet for "id"
  name:        string;
  status:      'ENABLED'|'PAUSED';
  startDate:   string;      // YYYY-MM-DD
  endDate:     string;      // YYYY-MM-DD
  budget?:     number;
  createdAt:   Date;
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