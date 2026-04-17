import express from 'express';
import { createExam, getExams, addResult, getMyResults, getExamResults } from '../controllers/exam.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.post('/', authorize('admin', 'faculty'), createExam);
router.get('/faculty', authorize('admin', 'faculty'), getExams);
router.post('/results', authorize('admin', 'faculty'), addResult);
router.get('/my-results', authorize('student'), getMyResults);
router.get('/:id/results', authorize('admin', 'faculty'), getExamResults);

export default router;