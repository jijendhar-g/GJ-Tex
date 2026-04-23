import express from 'express';
import { authUser, registerUser, getUserProfile, updateProfile, changePassword, forgotPassword, resetPassword } from '../controllers/auth.controller.js';
import { sendOTP, verifyOTP } from '../controllers/otp.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.route('/profile').get(protect, getUserProfile).put(protect, updateProfile);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/change-password', protect, changePassword);

export default router;
