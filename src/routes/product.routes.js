import { Router } from 'express';
import ProductController from '../controllers/product.controller.js';
import { 
  getProductValidation, 
  queryProductValidation, 
  validate 
} from '../validators/product.validators.js';

const router = Router();

/**
 * GET /products
 * @summary Get all products with pagination only
 * @tags Products
 * @param {number} page.query - Page number (default: 1)
 * @param {number} limit.query - Items per page (default: 10, max: 100)
 * @return {object} 200 - Products list with pagination info
 */
router.get('/', queryProductValidation, validate, ProductController.getAll);

/**
 * @typedef {object} upload
 * @property {string} Image - Product image - binary
 */

/**
 * GET /products/filter
 * @summary Advanced product filtering
 * @tags Products
 * @param {number} categoryId.query - Filter by category
 * @param {boolean} isFlashSale.query - Filter flash sale products
 * @param {boolean} isFavorite.query - Filter favorite products
 * @param {boolean} isBuy1Get1.query - Filter buy 1 get 1 products
 * @param {number} minPrice.query - Minimum price
 * @param {number} maxPrice.query - Maximum price
 * @param {upload} request.body.re 
 * @return {object} 200 - Filtered products
 */
router.get('/filter', ProductController.filterProducts);

/**
 * GET /products/favorite
 * @summary Get favorite products
 * @tags Products
 * @return {object} 200 - Favorite products
 */
router.get('/favorite', ProductController.getFavoriteProducts);

/**
 * GET /products/{id}
 * @summary Get product by ID
 * @tags Products
 * @param {number} id.path.required - Product ID
 * @return {object} 200 - Product details
 * @return {object} 404 - Product not found
 */
router.get('/:id', getProductValidation, validate, ProductController.getById);

export default router;