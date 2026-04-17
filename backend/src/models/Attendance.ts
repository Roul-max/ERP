import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
  course: mongoose.Schema.Types.ObjectId;
  date: Date;
  records: {
    student: mongoose.Schema.Types.ObjectId;
    status: 'Present' | 'Absent' | 'Late';
  }[];
}

const AttendanceSchema: Schema = new Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  date: { type: Date, required: true },
  records: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    status: { type: String, enum: ['Present', 'Absent', 'Late'], default: 'Present' }
  }]
}, { timestamps: true });

// Optimize lookups for marking attendance (course + date) and student history
AttendanceSchema.index({ course: 1, date: 1 }, { unique: true });
AttendanceSchema.index({ "records.student": 1 });

export default mongoose.model<IAttendance>('Attendance', AttendanceSchema);