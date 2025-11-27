import { Router } from 'express';
import HistoryController from '../controllers/history.controller.js';
import authMiddleware from '../middlewares/jwt.authentication.js';

const router = Router();

router.use(authMiddleware);

/**
 * GET /history
 * @summary Get order history with pagination
 * @tags History
 * @security BearerAuth
 * @param {number} page.query
 * @param {number} limit.query
 * @param {string} status.query
 * @param {string} startDate.query
 * @param {string} endDate.query
 * @param {string} month.query
 * @return {object} 200
 */
router.get('/', HistoryController.getHistory);

export default router;