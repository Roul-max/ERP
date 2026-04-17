import mongoose, { Schema, Document } from 'mongoose';

export interface ITimetable extends Document {
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  classOrBatch: string;
  teacher: string; // Just storing name for simplicity in this iteration
}

const TimetableSchema: Schema = new Schema({
  day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  subject: { type: String, required: true },
  classOrBatch: { type: String, required: true },
  teacher: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model<ITimetable>('Timetable', TimetableSchema);