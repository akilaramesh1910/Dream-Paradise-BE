import express from 'express';
import {
  getProductReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview,
} from '../controllers/review.controller';
import { protect } from '../middleware/auth.middleware';
import { validateReview } from '../middleware/validation.middleware';

const router = express.Router({ mergeParams: true });

// Public routes
router.get('/', getProductReviews);
router.get('/:id', getReview);

// Protected routes
router.use(protect);

router.post('/', validateReview, addReview);
router.route('/:id')
  .put(validateReview, updateReview)
  .delete(deleteReview);

export default router;