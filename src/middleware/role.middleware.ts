import { RequestHandler } from 'express';
import { CustomError } from './error.middleware';

type AuthUser = { _id: string; role: 'user' | 'admin' };

export const isAdmin: RequestHandler = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    console.log('User role is not admin:', req.user?.role);
    return res.status(403).json({ success: false, error: 'Not authorized as an admin' });
  }

  console.log('User authorized as admin');
  return next();
};
