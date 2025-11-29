import { Router } from 'express';
import AuthController from '../controllers/auth.controller.js';
import { registerValidation, loginValidation, validate } from '../validators/auth.validators.js';

const router = Router();

/**
 * POST /auth/register
 * @summary Register new user
 * @tags Authentication
 * @param {string} email.query.required - Email address
 * @param {string} password.query.required - Password (min 6 characters)
 * @param {string} fullName.query - Full name (optional)
 * @param {string} phone.query - Phone number (optional)
 * @param {string} role.query - Role: "customer" or "admin" (default: "customer")
 * @return {object} 201 - Registration successful
 * @return {object} 400 - Validation error
 * @return {object} 403 - Forbidden
 */
router.post('/register', registerValidation, validate, AuthController.register);

/**
 * POST /auth/login
 * @summary User login
 * @tags Authentication
 * @param {string} email.query.required - Email address
 * @param {string} password.query.required - Password
 * @return {object} 200 - Login successful
 * @return {object} 401 - Invalid credentials
 */
router.post('/login', loginValidation, validate, AuthController.login);

/**
 * POST /auth/forgot-password
 * @summary Request OTP for password reset
 * @tags Authentication
 * @param {string} email.query.required - Registered email
 * @return {object} 200 - OTP sent
 */
router.post('/forgot-password', AuthController.forgotPassword);

/**
 * POST /auth/verify-otp
 * @summary Verify OTP and reset password
 * @tags Authentication
 * @param {string} email.query.required - Email
 * @param {string} otp.query.required - 6-digit OTP
 * @param {string} newPassword.query.required - New password
 * @return {object} 200 - Password reset successful
 */
router.post('/verify-otp', AuthController.verifyOTP);

export default router;