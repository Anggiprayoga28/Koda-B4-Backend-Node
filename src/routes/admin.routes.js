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
 * @param {object} request.body.required
 * @param {string} request.body.name.required
 * @return {object} 201
 */
router.post('/categories', CategoryController.create);

/**
 * PATCH /admin/categories/{id}
 * @summary Update category
 * @tags Admin - Categories
 * @security BearerAuth
 * @param {number} id.path.required
 * @param {object} request.body.required
 * @param {string} request.body.name.required
 * @return {object} 200
 */
router.patch('/categories/:id', CategoryController.update);

/**
 * DELETE /admin/categories/{id}
 * @summary Delete category
 * @tags Admin - Categories
 * @security BearerAuth
 * @param {number} id.path.required
 * @return {object} 200
 */
router.delete('/categories/:id', CategoryController.delete);

// Products
/**
 * POST /admin/products
 * @summary Create product
 * @tags Admin - Products
 * @security BearerAuth
 * @param {string} name.form.required
 * @param {string} description.form
 * @param {number} categoryId.form.required
 * @param {number} price.form.required
 * @param {number} stock.form
 * @param {file} image.form
 * @return {object} 201
 */
router.post('/products', upload.single('image'), createProductValidation, validate, ProductController.create);

/**
 * PATCH /admin/products/{id}
 * @summary Update product
 * @tags Admin - Products
 * @security BearerAuth
 * @param {number} id.path.required
 * @return {object} 200
 */
router.patch('/products/:id', upload.single('image'), updateProductValidation, validate, ProductController.update);

/**
 * DELETE /admin/products/{id}
 * @summary Delete product
 * @tags Admin - Products
 * @security BearerAuth
 * @param {number} id.path.required
 * @return {object} 200
 */
router.delete('/products/:id', deleteProductValidation, validate, ProductController.delete);

// Orders
/**
 * GET /admin/orders
 * @summary Get all orders
 * @tags Admin - Orders
 * @security BearerAuth
 * @param {number} page.query
 * @param {number} limit.query
 * @return {object} 200
 */
router.get('/orders', OrderController.getAllOrders);

/**
 * GET /admin/orders/{id}
 * @summary Get order by ID
 * @tags Admin - Orders
 * @security BearerAuth
 * @param {number} id.path.required
 * @return {object} 200
 */
router.get('/orders/:id', OrderController.getOrderById);

/**
 * PATCH /admin/orders/{id}/status
 * @summary Update order status
 * @tags Admin - Orders
 * @security BearerAuth
 * @param {number} id.path.required
 * @param {object} request.body.required
 * @param {string} request.body.status.required
 * @return {object} 200
 */
router.patch('/orders/:id/status', OrderController.updateOrderStatus);

// Users
/**
 * GET /admin/users
 * @summary Get all users
 * @tags Admin - Users
 * @security BearerAuth
 * @param {number} page.query
 * @param {number} limit.query
 * @return {object} 200
 */
router.get('/users', UserController.getAll);

/**
 * GET /admin/users/{id}
 * @summary Get user by ID
 * @tags Admin - Users
 * @security BearerAuth
 * @param {number} id.path.required
 * @return {object} 200
 */
router.get('/users/:id', UserController.getById);

/**
 * POST /admin/users
 * @summary Create user
 * @tags Admin - Users
 * @security BearerAuth
 * @param {object} request.body.required
 * @param {string} request.body.email.required
 * @param {string} request.body.username.required
 * @param {string} request.body.password.required
 * @param {string} request.body.role.required
 * @return {object} 201
 */
router.post('/users', UserController.create);

/**
 * PATCH /admin/users/{id}
 * @summary Update user
 * @tags Admin - Users
 * @security BearerAuth
 * @param {number} id.path.required
 * @return {object} 200
 */
router.patch('/users/:id', UserController.update);

/**
 * DELETE /admin/users/{id}
 * @summary Delete user
 * @tags Admin - Users
 * @security BearerAuth
 * @param {number} id.path.required
 * @return {object} 200
 */
router.delete('/users/:id', UserController.delete);

// Promos
/**
 * POST /admin/promos
 * @summary Create promo
 * @tags Admin - Promos
 * @security BearerAuth
 * @param {object} request.body.required
 * @param {string} request.body.title.required
 * @param {string} request.body.description
 * @param {string} request.body.code.required
 * @return {object} 201
 */
router.post('/promos', PromoController.create);

/**
 * PATCH /admin/promos/{id}
 * @summary Update promo
 * @tags Admin - Promos
 * @security BearerAuth
 * @param {number} id.path.required
 * @return {object} 200
 */
router.patch('/promos/:id', PromoController.update);

/**
 * DELETE /admin/promos/{id}
 * @summary Delete promo
 * @tags Admin - Promos
 * @security BearerAuth
 * @param {number} id.path.required
 * @return {object} 200
 */
router.delete('/promos/:id', PromoController.delete);

export default router;