import { RequestHandler } from 'express';
import { CustomError } from './error.middleware';

type AuthUser = { _id: string; role: 'user' | 'admin' };

export const isAdmin: RequestHandler = (req, res, next) => {
  const user = (req as any).user as AuthUser | undefined;
  if (user && user.role === 'admin') {
    return next();
  }
  const error: CustomError = new Error('Not authorized as an admin') as CustomError;
  error.statusCode = 403;
  next(error);
};
