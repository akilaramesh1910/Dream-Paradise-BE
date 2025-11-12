import express from 'express';
import * as couponController from '../controllers/coupon.controller';
import { protect } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/role.middleware';

const router = express.Router();

router.post('/validate', couponController.validateCoupon);
router.post('/redeem', protect, couponController.redeemCoupon);
router.post('/', protect, isAdmin, couponController.createCoupon);

export default router;
