import Hostel from '../models/Hostel';

export const createRoom = async (data: any) => {
  return await Hostel.create(data);
};

export const getAllRooms = async () => {
  return await Hostel.find();
};

export const updateRoom = async (id: string, data: any) => {
  return await Hostel.findByIdAndUpdate(id, data, { new: true });
};

export const deleteRoom = async (id: string) => {
  return await Hostel.findByIdAndDelete(id);
};