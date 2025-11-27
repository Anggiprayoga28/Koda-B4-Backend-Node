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
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Pencarian maksimal 100 karakter'),

  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Harga minimum harus berupa angka positif'),

  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Harga maksimum harus berupa angka positif'),

  query('sortBy')
    .optional()
    .isIn(['name', 'price', 'stock', 'createdAt'])
    .withMessage('sortBy harus salah satu dari: name, price, stock, createdAt'),

  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('order harus salah satu dari: asc, desc'),
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