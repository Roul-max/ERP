import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  code: string;
  name: string;
  credits: number;
  faculty: mongoose.Schema.Types.ObjectId;
  department: string;
  semester: number;
}

const CourseSchema: Schema = new Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  credits: { type: Number, required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  department: { type: String, required: true },
  semester: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model<ICourse>('Course', CourseSchema);