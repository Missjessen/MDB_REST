// import { Response, NextFunction } from 'express'
// import { AuthenticatedRequest }   from '../interfaces/userReq'
// import {
//   syncAllFromSheetForUser,
//   syncSheetToAdsForUser
// } from '../services/syncSheetToAds'

// /**
//  * POST /api/sheets/:sheetId/sync-db
//  */
// export const syncDbController = async (
//   req: AuthenticatedRequest,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   if (!req.user?.refreshToken) {
//     res.status(401).json({ error: 'Login kræves' })
//     return
//   }

//   const sheetId = req.params.sheetId
//   try {
//     const result = await syncAllFromSheetForUser(
//       req.user._id.toString(),
//       sheetId
//     )
//     res.status(200).json(result)
//   } catch (err: any) {
//     next(err)
//   }
// }

// /**
//  * POST /api/sheets/:sheetId/sync-ads
//  */
// export const syncAdsController = async (
//   req: AuthenticatedRequest,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   if (!req.user?.refreshToken) {
//     res.status(401).json({ error: 'Login kræves' })
//     return
//   }

//   const sheetId = req.params.sheetId
//   try {
//     const statuses = await syncSheetToAdsForUser(
//       req.user._id.toString(),
//       sheetId
//     )
//     res.status(200).json({ statuses })
//   } catch (err: any) {
//     next(err)
//   }
// }

// /**
//  * POST /api/sheets/:sheetId/sync-all
//  */
// export const syncAllAndAdsController = async (
//   req: AuthenticatedRequest,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   if (!req.user?.refreshToken) {
//     res.status(401).json({ error: 'Login kræves' })
//     return
//   }

//   const sheetId = req.params.sheetId
//   try {
//     const dbResult    = await syncAllFromSheetForUser(
//       req.user._id.toString(),
//       sheetId
//     )
//     const adsStatuses = await syncSheetToAdsForUser(
//       req.user._id.toString(),
//       sheetId
//     )
//     res.status(200).json({
//       campaignsSynced: dbResult.campaigns,
//       adsSynced:      dbResult.ads,
//       keywordsSynced: dbResult.keywords,
//       adsStatuses,
//     })
//   } catch (err: any) {
//     next(err)
//   }
// }

