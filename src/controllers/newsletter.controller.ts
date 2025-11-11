import { Request, Response, NextFunction } from 'express';
import Newsletter from '../models/newsletter.model';
import { sendEmail } from '../utils/email';
import { CustomError } from '../middleware/error.middleware';

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
export const subscribe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    // Check if already subscribed
    let subscription = await Newsletter.findOne({ email });

    if (subscription) {
      if (subscription.status === 'subscribed') {
        const error: CustomError = new Error('Email already subscribed');
        error.statusCode = 400;
        throw error;
      }

      // If previously unsubscribed, update status
      subscription.status = 'subscribed';
      subscription.subscribedAt = new Date();
      subscription.unsubscribedAt = undefined;
      await subscription.save();
    } else {
      // Create new subscription
      subscription = await Newsletter.create({ email });
    }

    // Send welcome email
    await sendEmail({
      email,
      subject: 'Welcome to Our Newsletter',
      template: 'newsletter-welcome',
      data: { unsubscribeUrl: `${process.env.FRONTEND_URL}/newsletter/unsubscribe?email=${email}` },
    });

    res.status(200).json({
      success: true,
      message: 'Successfully subscribed to newsletter',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unsubscribe from newsletter
// @route   POST /api/newsletter/unsubscribe
// @access  Public
export const unsubscribe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const subscription = await Newsletter.findOne({ email });

    if (!subscription || subscription.status === 'unsubscribed') {
      const error: CustomError = new Error('Email not found or already unsubscribed');
      error.statusCode = 400;
      throw error;
    }

    subscription.status = 'unsubscribed';
    subscription.unsubscribedAt = new Date();
    await subscription.save();

    // Send unsubscribe confirmation email
    await sendEmail({
      email,
      subject: 'Newsletter Unsubscription Confirmed',
      template: 'newsletter-unsubscribe',
      data: { resubscribeUrl: `${process.env.FRONTEND_URL}/newsletter/subscribe` },
    });

    res.status(200).json({
      success: true,
      message: 'Successfully unsubscribed from newsletter',
    });
  } catch (error) {
    next(error);
  }
};