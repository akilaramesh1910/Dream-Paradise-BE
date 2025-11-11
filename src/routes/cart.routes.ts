import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../controllers/cart.controller';
import { protect } from '../middleware/auth.middleware';
import { validateCartItem } from '../middleware/validation.middleware';

const router = express.Router();

router.use(protect); // All cart routes are protected

router.route('/')
  .get(getCart)
  .post(validateCartItem, addToCart)
  .delete(clearCart);

router.route('/:productId')
  .put(validateCartItem, updateCartItem)
  .delete(removeFromCart);

export default router;