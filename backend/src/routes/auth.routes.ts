import express from 'express';
import { 
  login, 
  getMe, 
  updateProfile, 
  changePassword,
  updateAvatar,
  deleteAvatar,
  getPreferences,
  updatePreferences,
  forgotPassword, 
  resetPassword,
  googleAuth,
  googleCallback
} from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resettoken', resetPassword);

// OAuth
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

// Protected
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.put('/avatar', protect, updateAvatar);
router.delete('/avatar', protect, deleteAvatar);
router.get('/preferences', protect, getPreferences);
router.put('/preferences', protect, updatePreferences);

export default router;
