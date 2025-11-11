import { Request, Response, NextFunction } from 'express';
import CustomRequest from '../models/customRequest.model';
import { CustomError } from '../middleware/error.middleware';
import { sendEmail } from '../utils/email';

// @desc Create a custom request (from frontend)
// @route POST /api/custom-request
// @access Public
export const createCustomRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, phone, details } = req.body;

    const request = await CustomRequest.create({ name, email, phone, details });

    // Notify admin
    try {
      await sendEmail({
        email: process.env.ADMIN_EMAIL as string,
        subject: 'New Custom Request',
        template: 'custom-request-admin',
        data: { name, email, phone, details },
      });
    } catch (e) {
      // don't block creating the request if email fails
      console.error('Failed to send admin notification', e);
    }

    res.status(201).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

// @desc Get all custom requests (admin)
// @route GET /api/custom-request
// @access Private/Admin
export const getCustomRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requests = await CustomRequest.find().sort('-createdAt');
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

// @desc Update custom request status (admin)
// @route PUT /api/custom-request/:id
// @access Private/Admin
export const updateCustomRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const request = await CustomRequest.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!request) {
      const err: CustomError = new Error('Custom request not found');
      err.statusCode = 404;
      throw err;
    }
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};
