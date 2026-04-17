import express from 'express';
import { markAttendance, getStudentAttendance } from '../controllers/attendance.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.post('/', authorize('faculty', 'admin'), markAttendance);
router.get('/my', authorize('student'), getStudentAttendance);

export default router;