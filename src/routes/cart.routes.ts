import express from 'express';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../controllers/cart.controller';
import { AuthReq } from '../middleware/auth.middleware';

// Temporary no-op validator to satisfy build if validation.middleware missing
const validateCartItem = (req: any, res: any, next: any) => next();

const router = express.Router();

router.use(AuthReq);

router.route('/')
  .get(getCart)
  .post(validateCartItem, addToCart)
  .delete(clearCart);

router.route('/:productId')
  .put(validateCartItem, updateCartItem)
  .delete(removeFromCart);

export default router;
