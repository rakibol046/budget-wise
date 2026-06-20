import { Router } from 'express';
import {
  register, login, getMe,
  verifyEmail, resendOtp,
  updateProfile, updatePassword, updateSettings,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import {
  registerRules, loginRules, verifyEmailRules, resendOtpRules,
  updateProfileRules, updatePasswordRules, updateSettingsRules,
  validate,
} from '../middleware/validation.js';

const router = Router();

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.post('/verify-email', verifyEmailRules, validate, verifyEmail);
router.post('/resend-otp', resendOtpRules, validate, resendOtp);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfileRules, validate, updateProfile);
router.put('/password', protect, updatePasswordRules, validate, updatePassword);
router.put('/settings', protect, updateSettingsRules, validate, updateSettings);

export default router;
