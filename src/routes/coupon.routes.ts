import express from 'express';
import * as couponController from '../controllers/coupon.controller';
import { AuthReq } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/role.middleware';

const router = express.Router();

router.post('/validate', couponController.validateCoupon);
router.post('/redeem', AuthReq, couponController.redeemCoupon);
router.post('/', AuthReq, isAdmin, couponController.createCoupon);

export default router;
