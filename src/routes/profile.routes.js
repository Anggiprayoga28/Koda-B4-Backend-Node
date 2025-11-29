import { Router } from 'express';
import ProfileController from '../controllers/profile.controller.js';
import authMiddleware from '../middlewares/jwt.authentication.js';
import upload from '../lib/upload.js';

const router = Router();

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
 * Update Profile
 * @typedef {object} UpdateProfileRequest
 * @property {string} fullName.form - Full name
 * @property {string} phone.form - Phone number
 * @property {string} address.form - Address
 * @property {string} oldPassword.form - Old password (required if changing password)
 * @property {string} newPassword.form - New password
 * @property {string} confirmPassword.form - Confirm new password
 * @property {string} photo.form - Profile photo - binary
 */

/**
 * PATCH /profile
 * @summary Update user profile
 * @tags Profile
 * @security BearerAuth
 * @param {UpdateProfileRequest} request.body.required - Form to update profile - multipart/form-data
 * @return {object} 200 - Profile updated successfully
 * @return {object} 400 - Bad request
 * @return {object} 401 - Unauthorized
 */
router.patch('/', upload.single('photo'), ProfileController.updateProfile);

export default router;