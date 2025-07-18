import express from 'express';
import {
  register,
  login,
  refresh,
  forgotPassword,
  resetPassword,
  validateResetToken,
  logout,
  getProfile,
  updateProfile
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { loginLimiter, passwordResetLimiter } from '../middleware/rateLimiter.js';
import {
  validateRegistration,
  validateLogin,
  validateForgotPassword,
  validateResetPassword
} from '../middleware/validation.js';

const router = express.Router();

// Public routes with rate limiting and validation
router.post('/register', validateRegistration, register);
router.post('/login', loginLimiter, validateLogin, login);
router.post('/refresh', refresh);
router.post('/forgot-password', passwordResetLimiter, validateForgotPassword, forgotPassword);
router.post('/reset-password', validateResetPassword, resetPassword);
router.get('/validate-reset-token', validateResetToken);
router.post('/logout', logout);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

export default router;