import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  user: mongoose.Schema.Types.ObjectId;
  rollNumber: string;
  department: string;
  batch: string;
  contactNumber: string;
  address: string;
}

const StudentSchema: Schema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rollNumber: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  batch: { type: String, required: true },
  contactNumber: { type: String },
  address: { type: String }
}, { timestamps: true });

// Compound index for frequent filtering in student list
StudentSchema.index({ department: 1, batch: 1 });
StudentSchema.index({ user: 1 }); // Foreign key index

export default mongoose.model<IStudent>('Student', StudentSchema);