import mongoose, { Schema, Document } from 'mongoose';

export interface IStaff extends Document {
  user: mongoose.Schema.Types.ObjectId;
  department: string;
  designation: string;
  joiningDate: Date;
  salary: number;
  phone: string;
}

const StaffSchema: Schema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  department: { type: String, required: true },
  designation: { type: String, required: true },
  joiningDate: { type: Date, required: true },
  salary: { type: Number, required: true },
  phone: { type: String }
}, { timestamps: true });

export default mongoose.model<IStaff>('Staff', StaffSchema);