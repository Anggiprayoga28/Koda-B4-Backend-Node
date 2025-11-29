import { body, param, query, validationResult } from 'express-validator';

const createProductValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Nama produk harus diisi')
    .isLength({ min: 5, max: 50 })
    .withMessage('Nama produk harus antara 5-50 karakter'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Deskripsi maksimal 500 karakter'),

  body('price')
    .notEmpty()
    .withMessage('Harga harus diisi')
    .isFloat({ min: 0 })
    .withMessage('Harga harus berupa angka positif'),

  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stok harus berupa angka bulat positif'),
];

const updateProductValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID produk tidak valid'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Nama produk harus antara 3-100 karakter'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Deskripsi maksimal 500 karakter'),

  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Harga harus berupa angka positif'),

  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stok harus berupa angka bulat positif'),
];

const getProductValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID produk tidak valid'),
];

const deleteProductValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID produk tidak valid'),
];

const queryProductValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page harus berupa angka bulat positif'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit harus berupa angka bulat antara 1-100'),
];

const validate = (req, res, next) => {
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

export {
  createProductValidation,
  updateProductValidation,
  getProductValidation,
  deleteProductValidation,
  queryProductValidation,
  validate
};

export default {
  createProductValidation,
  updateProductValidation,
  getProductValidation,
  deleteProductValidation,
  queryProductValidation,
  validate
};