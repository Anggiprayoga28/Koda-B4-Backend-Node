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
 * @summary Get all products with pagination and filters
 * @tags Products
 * @param {string} search.query - Search by name or description
 * @param {number} minPrice.query - Minimum price
 * @param {number} maxPrice.query - Maximum price
 * @param {string} sortBy.query - Sort field (name, price, stock, createdAt)
 * @param {string} order.query - Sort order (asc, desc)
 * @param {number} page.query - Page number
 * @param {number} limit.query - Items per page
 * @return {object} 200 - Products list
 */
router.get('/', queryProductValidation, validate, ProductController.getAll);

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
 * @param {string} search.query - Search keyword
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