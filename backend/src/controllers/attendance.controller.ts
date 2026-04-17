import { Request, Response } from 'express';
import Attendance from '../models/Attendance';
import Student from '../models/Student';

export const markAttendance = async (req: any, res: any) => {
  try {
    const { courseId, date, records } = req.body;
    
    let attendance = await Attendance.findOne({ course: courseId, date: new Date(date) });
    
    if (attendance) {
      attendance.records = records;
      await attendance.save();
    } else {
      attendance = await Attendance.create({
        course: courseId,
        date: new Date(date),
        records
      });
    }
    
    res.status(201).json(attendance);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getStudentAttendance = async (req: any, res: any) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const attendance = await Attendance.find({ "records.student": student._id as any })
      .populate('course', 'name code')
      .select('date course records');

    // Filter records to show only this student's status
    const result = attendance.map(att => ({
      date: att.date,
      course: att.course,
      status: att.records.find((r: any) => r.student.toString() === student._id.toString())?.status
    }));

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};