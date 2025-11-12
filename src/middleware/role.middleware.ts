import { Request, Response, NextFunction } from 'express';
import { CustomError } from './error.middleware';

type AuthUser = { _id: string; role: 'user' | 'admin' };
type AuthRequest = Request & { user?: AuthUser };

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user && req.user.role === 'admin') {
      return next();
    }
    const error: CustomError = new Error('Not authorized as an admin') as CustomError;
    error.statusCode = 403;
    throw error;
  } catch (err) {
    next(err);
  }
};
