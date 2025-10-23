import express from 'express';
import { signupUser, loginUser, sendOTP, verifyOTP } from '../controllers/user.controller.js';

const router = express.Router();

// POST /api/user/send-otp - Send OTP for email verification
router.post('/send-otp', sendOTP);

// POST /api/user/verify-otp - Verify OTP
router.post('/verify-otp', verifyOTP);

// POST /api/user/signup - Register a new user
router.post('/signup', signupUser);

// POST /api/user/login - Login user
router.post('/login', loginUser);

export default router;
