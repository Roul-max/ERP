import mongoose, { Schema, Document } from 'mongoose';

export interface IExam extends Document {
  course: mongoose.Schema.Types.ObjectId;
  name: string; // Mid-term, Final, Quiz 1
  date: Date;
  totalMarks: number;
}

const ExamSchema: Schema = new Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  name: { type: String, required: true },
  date: { type: Date, required: true },
  totalMarks: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model<IExam>('Exam', ExamSchema);