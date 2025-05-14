// src/controllers/sheetsController.ts

import { NextFunction, Response } from 'express';
import { Types } from 'mongoose';
import { SheetModel } from '../models/SheetModel';
// ⚡️ Importér den nye helper i stedet for createUserSheet + createOAuthClient
import { createUserSheetFor } from '../services/googleSheetsService';
import { AuthenticatedRequest } from '../interfaces/userReq';

/**
 * POST /api/sheets
 */
export const createSheet = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    const name = req.body.name as string;
    if (!name) {
      res.status(400).json({ error: 'Navn på sheet mangler' });
      return;
    }

    // Tjek om brugeren allerede har et sheet med samme navn
    const exists = await SheetModel.findOne({ userId: user._id, name });
    if (exists) {
      res.status(409).json({ error: 'Du har allerede et sheet med dette navn' });
      return;
    }

    //  ⚡️ Her kalder vi kun én funktion, som selv henter og fornyer Google‐token
    const sheetId = await createUserSheetFor(user._id.toString(), name);
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}`;

    // Gem sheet‐metadata i DB
    const sheet = await SheetModel.create({
      userId:   new Types.ObjectId(user._id),
      sheetId,
      name,
      sheetUrl
    });

    res.status(201).json(sheet);

  } catch (err: any) {
    //  Mongo duplicate‐key?
    if (err.code === 11000) {
      res.status(409).json({ error: 'Sheet-navn allerede i brug' });
    } else {
      next(err);
    }
  }
};

/**
 * GET /api/sheets
 */
export const getSheets = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    const docs = await SheetModel.find({ userId: user._id }).lean().exec();
    res.json(docs);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/sheets/:id
 */
export const getSheetById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    const doc = await SheetModel
      .findOne({ _id: req.params.id, userId: user._id })
      .lean()
      .exec();

    if (!doc) {
      res.status(404).json({ error: 'Sheet ikke fundet' });
      return;
    }
    res.json(doc);

  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/sheets/:id
 */
export const updateSheetById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    const newName = req.body.name as string;
    if (!newName) {
      res.status(400).json({ error: 'Nyt navn mangler' });
      return;
    }

    const updated = await SheetModel.findOneAndUpdate(
      { _id: req.params.id, userId: user._id },
      { name: newName },
      { new: true, lean: true }
    );

    if (!updated) {
      res.status(404).json({ error: 'Sheet ikke fundet' });
      return;
    }

    // (valgfrit) og omdøb filen i Drive, hvis du vil
    /*
    try {
      await renameGoogleSheetForUser(user._id.toString(), updated.sheetId, newName);
    } catch (e) {
      console.warn('Drive rename fejlede:', e.message);
    }
    */

    res.json(updated);

  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/sheets/:id
 */
export const deleteSheetById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    const doc = await SheetModel.findOne({ _id: req.params.id, userId: user._id });
    if (!doc) {
      res.status(404).json({ error: 'Sheet ikke fundet' });
      return;
    }

    // (valgfrit) slet i Drive også
    /*
    try {
      await deleteGoogleSheetForUser(user._id.toString(), doc.sheetId);
    } catch (e) {
      console.warn('Drive delete fejlede:', e.message);
    }
    */

    await SheetModel.deleteOne({ _id: req.params.id });
    res.json({ message: 'Sheet slettet' });

  } catch (err) {
    next(err);
  }
};
