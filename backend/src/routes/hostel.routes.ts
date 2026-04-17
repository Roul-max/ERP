import express from 'express';
import { createRoom, getAllRooms, updateRoom, deleteRoom } from '../controllers/hostel.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);
router.use(authorize('admin')); // Only admin can manage hostel

router.post('/', createRoom);
router.get('/', getAllRooms);
router.put('/:id', updateRoom);
router.delete('/:id', deleteRoom);

export default router;