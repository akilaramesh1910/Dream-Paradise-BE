import { Request, Response, NextFunction } from 'express';
import { check, validationResult } from 'express-validator';
import { CustomError } from './error.middleware';

// Validation for user registration
export const validateRegister = [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  validateResults,
];

// Validation for user login
export const validateLogin = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists(),
  validateResults,
];

// Validation for product creation/update
export const validateProduct = [
  check('name', 'Product name is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty(),
  check('price', 'Price must be a positive number').isFloat({ min: 0 }),
  check('category', 'Category is required').not().isEmpty(),
  check('stock', 'Stock must be a non-negative number').isInt({ min: 0 }),
  validateResults,
];

// Validation for category creation/update
export const validateCategory = [
  check('name', 'Category name is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty(),
  check('image', 'Image URL is required').not().isEmpty(),
  validateResults,
];

// Validation for contact form
export const validateContact = [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('message', 'Message is required').not().isEmpty(),
  validateResults,
];

// Validation for newsletter subscription
export const validateNewsletter = [
  check('email', 'Please include a valid email').isEmail(),
  validateResults,
];

// Common validation result checker
const validateResults = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error: CustomError = new Error('Validation Error');
    error.statusCode = 400;
    error.errors = errors.array();
    throw error;
  }
  next();
};