import { Router } from 'express';
import TransactionController from '../controllers/transaction.controller.js';
import authMiddleware from '../middlewares/jwt.authentication.js';

const router = Router();

router.use(authMiddleware);

/**
 * POST /transactions/checkout
 * @summary Checkout cart and create order
 * @tags Transactions
 * @security BearerAuth
 * @param {object} request.body
 * @param {string} request.body.email
 * @param {string} request.body.fullName
 * @param {string} request.body.address
 * @param {string} request.body.deliveryMethod
 * @param {number} request.body.paymentMethodId
 * @return {object} 201
 * @return {object} 400
 */
router.post('/checkout', TransactionController.checkout);

export default router;