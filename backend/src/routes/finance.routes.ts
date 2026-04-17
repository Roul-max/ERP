import express from 'express';
import { createFee, getAllFees, getMyFees, payFee } from '../controllers/finance.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.post('/', authorize('admin'), createFee);
router.get('/all', authorize('admin'), getAllFees);
router.get('/my', authorize('student'), getMyFees);
router.put('/:id/pay', authorize('student'), payFee);

export default router;