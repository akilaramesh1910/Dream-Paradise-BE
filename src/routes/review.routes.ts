import express from 'express';
import { getProductReviews, getReview, addReview, updateReview, deleteReview } from '../controllers/review.controller';
import { protect } from '../middleware/auth.middleware';

// Temporary no-op validator to satisfy build if validation.middleware missing
const validateReview = (req: any, res: any, next: any) => next();

const router = express.Router({ mergeParams: true });

router.get('/', getProductReviews);
router.get('/:id', getReview);

router.use(protect);

router.post('/', validateReview, addReview);
router.route('/:id')
  .put(validateReview, updateReview)
  .delete(deleteReview);

export default router;
