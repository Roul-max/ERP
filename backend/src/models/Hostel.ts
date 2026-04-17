import mongoose, { Schema, Document } from 'mongoose';

export interface IHostel extends Document {
  name: string;
  roomNumber: string;
  capacity: number;
  occupied: number;
  type: 'Boys' | 'Girls';
}

const HostelSchema: Schema = new Schema({
  name: { type: String, required: true },
  roomNumber: { type: String, required: true },
  capacity: { type: Number, required: true },
  occupied: { type: Number, default: 0 },
  type: { type: String, enum: ['Boys', 'Girls'], required: true }
}, { timestamps: true });

export default mongoose.model<IHostel>('Hostel', HostelSchema);