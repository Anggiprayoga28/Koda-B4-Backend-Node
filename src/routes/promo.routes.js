import { Router } from 'express';
import PromoController from '../controllers/promo.controller.js';

const router = Router();

/**
 * GET /promos
 * @summary Get all active promos
 * @tags Promos
 * @return {object} 200
 */
router.get('/', PromoController.getAll);

/**
 * GET /promos/{code}
 * @summary Get promo by code
 * @tags Promos
 * @param {string} code.path.required
 * @return {object} 200
 * @return {object} 404
 */
router.get('/:code', PromoController.getByCode);

export default router;