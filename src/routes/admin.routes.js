import { Router } from 'express';
import CategoryController from '../controllers/category.controller.js';
import ProductController from '../controllers/product.controller.js';
import OrderController from '../controllers/order.controller.js';
import UserController from '../controllers/user.controller.js';
import PromoController from '../controllers/promo.controller.js';
import authMiddleware from '../middlewares/jwt.authentication.js';
import adminMiddleware from '../middlewares/admin.middleware.js';
import upload from '../lib/upload.js';
import { 
  createProductValidation, 
  updateProductValidation, 
  deleteProductValidation, 
  validate 
} from '../validators/product.validators.js';

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

// Categories
/**
 * POST /admin/categories
 * @summary Create category
 * @tags Admin - Categories
 * @security BearerAuth
 * @param {string} name.query.required - Category name
 * @return {object} 201
 */
router.post('/categories', CategoryController.create);

/**
 * PATCH /admin/categories/{id}
 * @summary Update category
 * @tags Admin - Categories
 * @security BearerAuth
 * @param {number} id.path.required - Category ID
 * @param {string} name.query.required - Category name
 * @return {object} 200
 */
router.patch('/categories/:id', CategoryController.update);

/**
 * DELETE /admin/categories/{id}
 * @summary Delete category
 * @tags Admin - Categories
 * @security BearerAuth
 * @param {number} id.path.required - Category ID
 * @return {object} 200
 */
router.delete('/categories/:id', CategoryController.delete);

// Products
/**
 * POST /admin/products
 * @summary Create product
 * @tags Admin - Products
 * @security BearerAuth
 * @param {string} name.form.required - Product name
 * @param {string} description.form - Product description
 * @param {number} categoryId.form.required - Category ID
 * @param {number} price.form.required - Product price
 * @param {number} stock.form - Product stock
 * @param {file} image.form - Product image
 * @return {object} 201
 */
router.post('/products', upload.single('image'), createProductValidation, validate, ProductController.create);

/**
 * Update Product
 * @typedef {object} UpdateProductRequest
 * @property {string} name.form - Product name
 * @property {string} description.form - Product description
 * @property {integer} categoryId.form - Category ID
 * @property {number} price.form - Product price 
 * @property {integer} stock.form - Product stock 
 * @property {string} image.form.required - Product image - binary
 */

/**
 * PATCH /admin/products/{id}
 * @summary Update product
 * @tags Admin - Products
 * @security BearerAuth
 * @param {integer} id.path.required - Product ID
 * @param {UpdateProductRequest} request.body - Form to update product - multipart/form-data
 * @return {object} 200 - Success response
 * @return {object} 400 - Bad request
 * @return {object} 401 - Unauthorized
 * @return {object} 404 - Product not found
 */
router.patch('/products/:id', upload.single('image'), updateProductValidation, validate, ProductController.update);

/**
 * DELETE /admin/products/{id}
 * @summary Delete product
 * @tags Admin - Products
 * @security BearerAuth
 * @param {number} id.path.required - Product ID
 * @return {object} 200
 */
router.delete('/products/:id', deleteProductValidation, validate, ProductController.delete);

// Orders
/**
 * GET /admin/orders
 * @summary Get all orders
 * @tags Admin - Orders
 * @security BearerAuth
 * @param {number} page.query - Page number
 * @param {number} limit.query - Items per page
 * @return {object} 200
 */
router.get('/orders', OrderController.getAllOrders);

/**
 * GET /admin/orders/{id}
 * @summary Get order by ID
 * @tags Admin - Orders
 * @security BearerAuth
 * @param {number} id.path.required - Order ID
 * @return {object} 200
 */
router.get('/orders/:id', OrderController.getOrderById);

/**
 * PATCH /admin/orders/{id}/status
 * @summary Update order status
 * @tags Admin - Orders
 * @security BearerAuth
 * @param {number} id.path.required - Order ID
 * @param {string} status.query.required - Order status (pending, processing, completed, cancelled)
 * @return {object} 200
 */
router.patch('/orders/:id/status', OrderController.updateOrderStatus);

// Users
/**
 * GET /admin/users
 * @summary Get all users
 * @tags Admin - Users
 * @security BearerAuth
 * @param {number} page.query - Page number
 * @param {number} limit.query - Items per page
 * @return {object} 200
 */
router.get('/users', UserController.getAll);

/**
 * GET /admin/users/{id}
 * @summary Get user by ID
 * @tags Admin - Users
 * @security BearerAuth
 * @param {number} id.path.required - User ID
 * @return {object} 200
 */
router.get('/users/:id', UserController.getById);

/**
 * POST /admin/users
 * @summary Create user
 * @tags Admin - Users
 * @security BearerAuth
 * @param {string} email.query.required - Email address
 * @param {string} username.query.required - Username
 * @param {string} password.query.required - Password
 * @param {string} role.query.required - User role (user, admin)
 * @param {string} fullName.query - Full name
 * @param {string} phone.query - Phone number
 * @return {object} 201
 */
router.post('/users', UserController.create);

/**
 * PATCH /admin/users/{id}
 * @summary Update user
 * @tags Admin - Users
 * @security BearerAuth
 * @param {number} id.path.required - User ID
 * @param {string} email.query - Email address
 * @param {string} username.query - Username
 * @param {string} password.query - Password
 * @param {string} role.query - User role
 * @param {string} fullName.query - Full name
 * @param {string} phone.query - Phone number
 * @return {object} 200
 */
router.patch('/users/:id', UserController.update);

/**
 * DELETE /admin/users/{id}
 * @summary Delete user
 * @tags Admin - Users
 * @security BearerAuth
 * @param {number} id.path.required - User ID
 * @return {object} 200
 */
router.delete('/users/:id', UserController.delete);

// Promos
/**
 * POST /admin/promos
 * @summary Create promo
 * @tags Admin - Promos
 * @security BearerAuth
 * @param {string} title.query.required - Promo title
 * @param {string} description.query - Promo description
 * @param {string} code.query.required - Promo code
 * @param {number} discount.query - Discount amount
 * @param {number} discountPercent.query - Discount percentage
 * @param {string} startDate.query - Start date (ISO format)
 * @param {string} endDate.query - End date (ISO format)
 * @return {object} 201
 */
router.post('/promos', PromoController.create);

/**
 * PATCH /admin/promos/{id}
 * @summary Update promo
 * @tags Admin - Promos
 * @security BearerAuth
 * @param {number} id.path.required - Promo ID
 * @param {string} title.query - Promo title
 * @param {string} description.query - Promo description
 * @param {string} code.query - Promo code
 * @param {number} discount.query - Discount amount
 * @param {number} discountPercent.query - Discount percentage
 * @param {string} startDate.query - Start date (ISO format)
 * @param {string} endDate.query - End date (ISO format)
 * @return {object} 200
 */
router.patch('/promos/:id', PromoController.update);

/**
 * DELETE /admin/promos/{id}
 * @summary Delete promo
 * @tags Admin - Promos
 * @security BearerAuth
 * @param {number} id.path.required - Promo ID
 * @return {object} 200
 */
router.delete('/promos/:id', PromoController.delete);

export default router;