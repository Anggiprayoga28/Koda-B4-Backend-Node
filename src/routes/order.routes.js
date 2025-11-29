import { Router } from 'express';
import OrderController from '../controllers/order.controller.js';
import OrderDetailController from '../controllers/order_detail.controller.js';
import authMiddleware from '../middlewares/jwt.authentication.js';

const router = Router();

router.use(authMiddleware);

/**
 * POST /orders
 * @summary Create new order
 * @tags Orders
 * @security BearerAuth
 * @param {number} productId.query.required - Product ID
 * @param {number} quantity.query.required - Quantity
 * @param {number} sizeId.query - Size ID (optional)
 * @param {number} temperatureId.query - Temperature ID (optional)
 * @return {object} 201 - Order created
 * @return {object} 400 - Invalid data
 */
router.post('/', OrderController.createOrder);

/**
 * GET /orders/{id}/detail
 * @summary Get order detail
 * @tags Orders
 * @security BearerAuth
 * @param {number} id.path.required - Order ID
 * @return {object} 200 - Order details
 * @return {object} 404 - Order not found
 */
router.get('/:id/detail', OrderDetailController.getOrderDetail);

export default router;