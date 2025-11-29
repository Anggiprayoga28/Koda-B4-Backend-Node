import { Router } from 'express';
import CartController from '../controllers/cart.controller.js';
import authMiddleware from '../middlewares/jwt.authentication.js';

const router = Router();

router.use(authMiddleware);

/**
 * GET /cart
 * @summary Get user shopping cart
 * @tags Cart
 * @security BearerAuth
 * @return {object} 200 - Cart data
 * @return {object} 401 - Unauthorized
 */
router.get('/', CartController.getCart);

/**
 * POST /cart
 * @summary Add item to cart
 * @tags Cart
 * @security BearerAuth
 * @param {number} productId.query.required - Product ID
 * @param {number} quantity.query.required - Quantity
 * @param {number} sizeId.query - Size ID (optional)
 * @param {number} temperatureId.query - Temperature ID (optional)
 * @return {object} 201 - Item added
 * @return {object} 400 - Invalid data
 */
router.post('/', CartController.addToCart);

/**
 * PATCH /cart/{id}
 * @summary Update cart item quantity
 * @tags Cart
 * @security BearerAuth
 * @param {number} id.path.required - Cart item ID
 * @param {number} quantity.query.required - New quantity
 * @return {object} 200 - Item updated
 * @return {object} 404 - Item not found
 */
router.patch('/:id', CartController.updateCartItem);

/**
 * DELETE /cart/{id}
 * @summary Remove item from cart
 * @tags Cart
 * @security BearerAuth
 * @param {number} id.path.required - Cart item ID
 * @return {object} 200 - Item removed
 * @return {object} 404 - Item not found
 */
router.delete('/:id', CartController.removeFromCart);

/**
 * DELETE /cart
 * @summary Clear entire cart
 * @tags Cart
 * @security BearerAuth
 * @return {object} 200 - Cart cleared
 */
router.delete('/', CartController.clearCart);

export default router;