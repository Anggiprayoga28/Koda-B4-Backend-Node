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
 * @param {string} email.query.required - Email address
 * @param {string} fullName.query.required - Full name
 * @param {string} address.query.required - Delivery address
 * @param {string} deliveryMethod.query.required - Delivery method (delivery, pickup)
 * @param {number} paymentMethodId.query.required - Payment method ID
 * @param {string} promoCode.query - Promo code (optional)
 * @param {string} notes.query - Order notes (optional)
 * @return {object} 201 - Order created successfully
 * @return {object} 400 - Invalid data or empty cart
 */
router.post('/checkout', TransactionController.checkout);

export default router;