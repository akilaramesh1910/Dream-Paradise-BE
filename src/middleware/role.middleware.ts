import { Request, Response, NextFunction } from 'express';
import { CustomError } from './error.middleware';
import { AuthRequest } from './auth.middleware';

// Middleware to check if user is admin
export const isAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      const error: CustomError = new Error('Not authorized as an admin');
      error.statusCode = 403;
      throw error;
    }
  } catch (error) {
    next(error);
  }
};