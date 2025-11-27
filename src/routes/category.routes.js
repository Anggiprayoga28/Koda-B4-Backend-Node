import { Router } from 'express';
import CategoryController from '../controllers/category.controller.js';

const router = Router();

/**
 * GET /categories
 * @summary Get all categories
 * @tags Categories
 * @return {object} 200 - Categories list
 */
router.get('/', CategoryController.getAll);

/**
 * GET /categories/{id}
 * @summary Get category by ID
 * @tags Categories
 * @param {number} id.path.required - Category ID
 * @return {object} 200 - Category details
 * @return {object} 404 - Category not found
 */
router.get('/:id', CategoryController.getById);

export default router;