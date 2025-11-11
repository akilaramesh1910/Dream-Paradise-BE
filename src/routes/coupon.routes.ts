import express from 'express';
import { createCoupon, validateCoupon, redeemCoupon } from '../controllers/coupon.controller';
import { protect } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/role.middleware';

const router = express.Router();

// Public: validate coupon
router.post('/validate', validateCoupon);

// Protected: redeem coupon (user) and admin create
router.post('/redeem', protect, redeemCoupon);
router.post('/', protect, isAdmin, createCoupon);

export default router;
