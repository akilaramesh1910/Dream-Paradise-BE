import express from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} from '../controllers/wishlist.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect); // All wishlist routes are protected

router.route('/')
  .get(getWishlist)
  .delete(clearWishlist);

router.route('/:productId')
  .post(addToWishlist)
  .delete(removeFromWishlist);

export default router;