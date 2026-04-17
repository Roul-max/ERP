import express from 'express';
import { sendNotification, getMyNotifications, markRead, listBroadcasts } from '../controllers/notification.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.post('/', authorize('admin'), sendNotification);
router.get('/', getMyNotifications);
router.put('/:id/read', markRead);
router.get('/broadcasts', authorize('admin'), listBroadcasts);

export default router;
