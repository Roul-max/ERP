import express from 'express';
import { createEntry, getTimetable, deleteEntry } from '../controllers/timetable.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.post('/', authorize('admin'), createEntry);
router.get('/', getTimetable);
router.delete('/:id', authorize('admin'), deleteEntry);

export default router;