import { Request, Response } from 'express';
import * as examService from '../services/exam.service';

export const createExam = async (req: any, res: any) => {
  try {
    const exam = await examService.createExam(req.body);
    res.status(201).json(exam);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getExams = async (req: any, res: any) => {
  try {
    // Ideally filter by faculty ID
    const exams = await examService.getExamsByFaculty(req.user._id);
    res.json(exams);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addResult = async (req: any, res: any) => {
  try {
    const result = await examService.addResult(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getMyResults = async (req: any, res: any) => {
  try {
    const results = await examService.getStudentResults(req.user._id);
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getExamResults = async (req: any, res: any) => {
  try {
    const results = await examService.getExamResults(req.params.id);
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};