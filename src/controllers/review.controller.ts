import { Request, Response, NextFunction } from 'express';
import Review from '../models/review.model';
import Product from '../models/product.model';
import { CustomError } from '../middleware/error.middleware';

type AuthUser = { id: string; role?: string };
type AuthRequest = Request & { user: AuthUser };

// @desc    Get all reviews for a product
// @route   GET /api/products/:productId/reviews
// @access  Public
export const getProductReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public
export const getReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const review = await Review.findById(req.params.id).populate('user', 'name');

    if (!review) {
      const error: CustomError = new Error('Review not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add review
// @route   POST /api/products/:productId/reviews
// @access  Private
export const addReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      const error: CustomError = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      user: req.user.id,
      product: req.params.productId,
    });

    if (existingReview) {
      const error: CustomError = new Error('Product already reviewed');
      error.statusCode = 400;
      throw error;
    }

    const review = await Review.create({
      ...req.body,
      user: req.user.id,
      product: req.params.productId,
    });

    await review.populate('user', 'name');

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      const error: CustomError = new Error('Review not found');
      error.statusCode = 404;
      throw error;
    }

    // Make sure review belongs to user
    if (review.user.toString() !== req.user.id) {
      const error: CustomError = new Error('Not authorized to update this review');
      error.statusCode = 401;
      throw error;
    }

    review = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate('user', 'name');

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      const error: CustomError = new Error('Review not found');
      error.statusCode = 404;
      throw error;
    }

    // Make sure review belongs to user or user is admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      const error: CustomError = new Error('Not authorized to delete this review');
      error.statusCode = 401;
      throw error;
    }

    await review.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};