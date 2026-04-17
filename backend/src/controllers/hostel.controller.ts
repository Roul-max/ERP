import { Request, Response } from 'express';
import * as hostelService from '../services/hostel.service';

export const createRoom = async (req: any, res: any) => {
  try {
    const room = await hostelService.createRoom(req.body);
    res.status(201).json(room);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllRooms = async (req: any, res: any) => {
  try {
    const rooms = await hostelService.getAllRooms();
    res.json(rooms);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateRoom = async (req: any, res: any) => {
  try {
    const room = await hostelService.updateRoom(req.params.id, req.body);
    res.json(room);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteRoom = async (req: any, res: any) => {
  try {
    await hostelService.deleteRoom(req.params.id);
    res.json({ message: 'Room removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};