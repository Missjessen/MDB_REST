// src/controllers/campaignDefsController.ts
import { RequestHandler } from 'express';
import { connect, disconnect } from '../repository/database';
import { CampaignDefModel } from '../models/CampaignDefModel';
import { AuthenticatedRequest } from '../interfaces/userReq';

/**
 * GET  /api/campaign-defs/:sheetId
 */
export const getCampaignsForSheet: RequestHandler = async (req, res) => {
  const user = (req as AuthenticatedRequest).user;
  const { sheetId } = req.params;
  if (!user) {
    res.status(401).json({ error: 'Login kræves' });
    return;
  }

  await connect();
  try {
    const docs = await CampaignDefModel
      .find({ sheetId, userId: user._id })
      .lean()
      .exec();
    res.json(docs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  } finally {
    await disconnect();
  }
};

/**
 * PUT  /api/campaign-defs/:sheetId/:campaignId
 */
export const updateCampaign: RequestHandler = async (req, res) => {
  const user = (req as AuthenticatedRequest).user;
  const { sheetId, campaignId } = req.params;
  if (!user) {
    res.status(401).json({ error: 'Login kræves' });
    return;
  }

  await connect();
  try {
    const doc = await CampaignDefModel.findOneAndUpdate(
      { _id: campaignId, sheetId, userId: user._id },
      req.body,
      { new: true, lean: true }
    );
    if (!doc) {
      res.status(404).json({ error: 'Kampagne ikke fundet' });
    } else {
      res.json(doc);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  } finally {
    await disconnect();
  }
};

/**
 * DELETE  /api/campaign-defs/:sheetId/:campaignId
 */
export const deleteCampaign: RequestHandler = async (req, res) => {
  const user = (req as AuthenticatedRequest).user;
  const { sheetId, campaignId } = req.params;
  if (!user) {
    res.status(401).json({ error: 'Login kræves' });
    return;
  }

  await connect();
  try {
    const doc = await CampaignDefModel.findOneAndDelete({
      _id: campaignId,
      sheetId,
      userId: user._id
    });
    if (!doc) {
      res.status(404).json({ error: 'Kampagne ikke fundet' });
    } else {
      res.json({ message: 'Kampagne slettet' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  } finally {
    await disconnect();
  }
};
