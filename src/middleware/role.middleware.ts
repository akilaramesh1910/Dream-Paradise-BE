import { RequestHandler } from 'express';
import { CustomError } from './error.middleware';

type AuthUser = { _id: string; role: 'user' | 'admin' };

export const isAdmin: RequestHandler = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Not authorized as an admin' });
  }

  return next();
};
