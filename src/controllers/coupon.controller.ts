import { Request, Response, NextFunction } from 'express';
import Coupon from '../models/coupon.model';
import { CustomError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';

// @desc Create coupon (Admin)
// @route POST /api/coupons
// @access Private/Admin
export const createCoupon = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    next(error);
  }
};

// @desc Validate coupon and return discount info
// @route POST /api/coupons/validate
// @access Public
export const validateCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, cartTotal } = req.body;

    if (!code) {
      const err: CustomError = new Error('Coupon code is required');
      err.statusCode = 400;
      throw err;
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });
    if (!coupon) {
      const err: CustomError = new Error('Invalid coupon code');
      err.statusCode = 404;
      throw err;
    }

    const now = new Date();
    if (coupon.validFrom && coupon.validFrom > now) {
      const err: CustomError = new Error('Coupon not active yet');
      err.statusCode = 400;
      throw err;
    }

    if (coupon.validUntil && coupon.validUntil < now) {
      const err: CustomError = new Error('Coupon expired');
      err.statusCode = 400;
      throw err;
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      const err: CustomError = new Error('Coupon usage limit reached');
      err.statusCode = 400;
      throw err;
    }

    if (coupon.minPurchase && cartTotal < coupon.minPurchase) {
      const err: CustomError = new Error(`Minimum purchase of ${coupon.minPurchase} required`);
      err.statusCode = 400;
      throw err;
    }

    // compute discount
    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (coupon.value / 100) * cartTotal;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = coupon.value;
    }

    res.status(200).json({ success: true, data: { code: coupon.code, discount } });
  } catch (error) {
    next(error);
  }
};

// @desc Redeem coupon (decrement usage) - typically called when order completes
// @route POST /api/coupons/redeem
// @access Private
export const redeemCoupon = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });
    if (!coupon) {
      const err: CustomError = new Error('Invalid coupon code');
      err.statusCode = 404;
      throw err;
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      const err: CustomError = new Error('Coupon usage limit reached');
      err.statusCode = 400;
      throw err;
    }

    await coupon.incrementUsage();

    res.status(200).json({ success: true, message: 'Coupon redeemed' });
  } catch (error) {
    next(error);
  }
};
