import { Request, Response } from 'express';
import Course from '../models/Course';

export const createCourse = async (req: any, res: any) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getCourses = async (req: any, res: any) => {
  try {
    const courses = await Course.find().populate('faculty', 'name email');
    res.json(courses);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getFacultyCourses = async (req: any, res: any) => {
  try {
    const courses = await Course.find({ faculty: req.user._id });
    res.json(courses);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getCourse = async (req: any, res: any) => {
  try {
    const course = await Course.findById(req.params.id).populate('faculty', 'name email');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCourse = async (req: any, res: any) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCourse = async (req: any, res: any) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json({ message: 'Course removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
