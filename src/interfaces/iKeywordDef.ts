// src/interfaces/IKeywordDef.ts
// src/interfaces/IKeywordDef.ts
import { Types } from 'mongoose';

export interface IKeywordDef {
  // fjern: _id?: Types.ObjectId;
  userId:    Types.ObjectId;
  sheetId:   string;
  adGroup:   string;
  keyword:   string;
  matchType: 'BROAD' | 'PHRASE' | 'EXACT';
  cpc?:      number;
  createdAt?: Date;
}
