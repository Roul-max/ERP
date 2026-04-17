import express from 'express';
import { create, getAll, update, remove } from '../controllers/student.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

// Admin can manage student records; faculty can read student lists for attendance/exams.
router.post('/', authorize('admin'), create);
router.get('/', authorize('admin', 'faculty'), getAll);
router.put('/:id', authorize('admin'), update);
router.delete('/:id', authorize('admin'), remove);

export default router;
