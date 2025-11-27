import { body, validationResult } from 'express-validator';

export const registerValidation = [
  body('email')
    .trim()
    .isEmail().withMessage('Format email tidak valid')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password minimal 6 karakter')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password harus mengandung huruf besar, huruf kecil, dan angka'),
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 3 }).withMessage('Nama lengkap minimal 3 karakter'),
  body('phone')
    .optional()
    .trim()
    .matches(/^(\+62|62|0)[0-9]{9,12}$/).withMessage('Format nomor telepon tidak valid')
];

export const loginValidation = [
  body('email')
    .trim()
    .isEmail().withMessage('Format email tidak valid')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password harus diisi')
];

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validasi gagal',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};