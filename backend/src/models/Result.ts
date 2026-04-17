import mongoose, { Schema, Document } from 'mongoose';

export interface IResult extends Document {
  exam: mongoose.Schema.Types.ObjectId;
  student: mongoose.Schema.Types.ObjectId;
  marksObtained: number;
  grade?: string;
}

const ResultSchema: Schema = new Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  marksObtained: { type: Number, required: true },
  grade: { type: String }
}, { timestamps: true });

export default mongoose.model<IResult>('Result', ResultSchema);