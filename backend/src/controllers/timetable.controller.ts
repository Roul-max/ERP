import { Request, Response } from 'express';
import Timetable from '../models/Timetable';

export const createEntry = async (req: any, res: any) => {
  try {
    const entry = await Timetable.create(req.body);
    res.status(201).json(entry);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getTimetable = async (req: any, res: any) => {
  try {
    const { classOrBatch } = req.query;
    const filter: any = {};
    if (classOrBatch) {
      filter.classOrBatch = classOrBatch;
    }
    const timetable = await Timetable.find(filter);
    res.json(timetable);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteEntry = async (req: any, res: any) => {
  try {
    await Timetable.findByIdAndDelete(req.params.id);
    res.json({ message: 'Entry removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
