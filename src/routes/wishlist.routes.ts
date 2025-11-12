import express from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} from '../controllers/wishlist.controller';
import { AuthReq } from '../middleware/auth.middleware';

const router = express.Router();

router.use(AuthReq); // All wishlist routes are AuthReqed

router.route('/')
  .get(getWishlist)
  .delete(clearWishlist);

router.route('/:productId')
  .post(addToWishlist)
  .delete(removeFromWishlist);

export default router;