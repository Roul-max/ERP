import mongoose, { Schema, Document } from 'mongoose';

export interface IFee extends Document {
  student: mongoose.Schema.Types.ObjectId;
  amount: number;
  type: string; // Tuition, Library, Hostel, etc.
  dueDate: Date;
  status: 'Pending' | 'Paid';
  transactionId?: string;
  paymentDate?: Date;
}

const FeeSchema: Schema = new Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  amount: { type: Number, required: true },
  type: { type: String, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
  transactionId: { type: String },
  paymentDate: { type: Date }
}, { timestamps: true });

export default mongoose.model<IFee>('Fee', FeeSchema);