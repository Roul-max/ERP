import express from 'express';
import { createCourse, getCourses, getFacultyCourses, getCourse, updateCourse, deleteCourse } from '../controllers/course.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.post('/', authorize('admin'), createCourse);
router.get('/', authorize('admin', 'faculty', 'student'), getCourses);
router.get('/my', authorize('faculty'), getFacultyCourses);

// Specific course routes
router.get('/:id', authorize('admin', 'faculty', 'student'), getCourse);
router.put('/:id', authorize('admin'), updateCourse);
router.delete('/:id', authorize('admin'), deleteCourse);

export default router;
