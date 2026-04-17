import { Request, Response } from 'express';
import * as studentService from '../services/student.service';
import { createStudentSchema, updateStudentSchema } from '../validators/student.validator';

export const create = async (req: any, res: any) => {
  try {
    const validatedData = createStudentSchema.parse(req.body);
    const student = await studentService.createStudent(validatedData);
    res.status(201).json(student);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getAll = async (req: any, res: any) => {
  try {
    const result = await studentService.getAllStudents(req.query);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const update = async (req: any, res: any) => {
  try {
    const validatedData = updateStudentSchema.parse(req.body);
    const student = await studentService.updateStudent(req.params.id, validatedData);
    res.json(student);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const remove = async (req: any, res: any) => {
  try {
    await studentService.deleteStudent(req.params.id);
    res.json({ message: 'Student removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};