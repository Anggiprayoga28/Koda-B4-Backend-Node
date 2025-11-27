import { Router } from 'express';
import ProfileController from '../controllers/profile.controller.js';
import authMiddleware from '../middlewares/jwt.authentication.js';
import upload from '../lib/upload.js';

const router = Router();

// All profile routes require authentication
router.use(authMiddleware);

/**
 * GET /profile
 * @summary Get current user profile
 * @tags Profile
 * @security BearerAuth
 * @return {object} 200 - Profile data
 * @return {object} 401 - Unauthorized
 */
router.get('/', ProfileController.getProfile);

/**
 * PATCH /profile
 * @summary Update user profile
 * @tags Profile
 * @security BearerAuth
 * @param {string} fullName.form - Full name
 * @param {string} phone.form - Phone number
 * @param {string} address.form - Address
 * @param {string} oldPassword.form - Old password (if changing password)
 * @param {string} newPassword.form - New password
 * @param {string} confirmPassword.form - Confirm new password
 * @param {file} photo.form - Profile photo
 * @return {object} 200 - Profile updated
 * @return {object} 401 - Unauthorized
 */
router.patch('/', upload.single('photo'), ProfileController.updateProfile);

export default router;