import { Request, Response, NextFunction } from 'express';
import Wishlist from '../models/wishlist.model';
import Product from '../models/product.model';
import { CustomError } from '../middleware/error.middleware';

type AuthUser = { id: string; role?: string };

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req: any, res: Response, next: NextFunction) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user?.id }).populate('products');

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user?.id,
        products: [],
      });
    }

    res.status(200).json({
      success: true,
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist/:productId
// @access  Private
export const addToWishlist = async (req: any, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      const error: CustomError = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    let wishlist = await Wishlist.findOne({ user: req.user?.id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user?.id,
        products: [req.params.productId],
      });
    } else {
      // Check if product is already in wishlist
      if (!wishlist.products.includes(req.params.productId)) {
        wishlist.products.push(req.params.productId);
        wishlist.updatedAt = new Date();
        await wishlist.save();
      }
    }

    await wishlist.populate('products');

    res.status(200).json({
      success: true,
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const removeFromWishlist = async (req: any, res: Response, next: NextFunction) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user?.id });
    if (!wishlist) {
      const error: CustomError = new Error('Wishlist not found');
      error.statusCode = 404;
      throw error;
    }

    wishlist.products = wishlist.products.filter(
      productId => productId.toString() !== req.params.productId
    );
    wishlist.updatedAt = new Date();
    await wishlist.save();
    await wishlist.populate('products');

    res.status(200).json({
      success: true,
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear wishlist
// @route   DELETE /api/wishlist
// @access  Private
export const clearWishlist = async (req: any, res: Response, next: NextFunction) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user?.id });
    if (!wishlist) {
      const error: CustomError = new Error('Wishlist not found');
      error.statusCode = 404;
      throw error;
    }

    wishlist.products = [];
    wishlist.updatedAt = new Date();
    await wishlist.save();

    res.status(200).json({
      success: true,
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
};