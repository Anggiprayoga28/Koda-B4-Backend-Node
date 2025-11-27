import { Router } from 'express';
import AuthController from '../controllers/auth.controller.js';
import { registerValidation, loginValidation, validate } from '../validators/auth.validators.js';

const router = Router();

/**
 * POST /auth/register
 * @summary Register new user
 * @tags Authentication
 * @param {object} request.body.required - User registration data
 * @param {string} request.body.email.required - Email address
 * @param {string} request.body.password.required - Password (min 6 characters)
 * @param {string} request.body.fullName - Full name (optional)
 * @param {string} request.body.phone - Phone number (optional)
 * @return {object} 201 - Registration successful
 * @return {object} 400 - Validation error
 */
router.post('/register', registerValidation, validate, AuthController.register);

/**
 * POST /auth/login
 * @summary User login
 * @tags Authentication
 * @param {object} request.body.required - Login credentials
 * @param {string} request.body.email.required - Email address
 * @param {string} request.body.password.required - Password
 * @return {object} 200 - Login successful
 * @return {object} 401 - Invalid credentials
 */
router.post('/login', loginValidation, validate, AuthController.login);

/**
 * POST /auth/verify-token
 * @summary Verify JWT token
 * @tags Authentication
 * @security BearerAuth
 * @return {object} 200 - Token valid
 * @return {object} 401 - Invalid token
 */
router.post('/verify-token', AuthController.verifyToken);

/**
 * POST /auth/forgot-password
 * @summary Request OTP for password reset
 * @tags Authentication
 * @param {object} request.body.required - Email
 * @param {string} request.body.email.required - Registered email
 * @return {object} 200 - OTP sent
 */
router.post('/forgot-password', AuthController.forgotPassword);

/**
 * POST /auth/verify-otp
 * @summary Verify OTP and reset password
 * @tags Authentication
 * @param {object} request.body.required - OTP data
 * @param {string} request.body.email.required - Email
 * @param {string} request.body.otp.required - 6-digit OTP
 * @param {string} request.body.newPassword.required - New password
 * @return {object} 200 - Password reset successful
 */
router.post('/verify-otp', AuthController.verifyOTP);

export default router;