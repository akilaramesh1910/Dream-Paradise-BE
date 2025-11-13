import { Request, Response, NextFunction } from 'express';
import Contact from '../models/contact.model';
import { sendEmail } from '../utils/email';
import { CustomError } from '../middleware/error.middleware';

type AuthUser = { id: string; role?: string };

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
export const submitContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contact = await Contact.create(req.body);

    // Send auto-reply email to user
    await sendEmail({
      email: contact.email,
      subject: 'Thank you for contacting us',
      template: 'contact-auto-reply',
      data: { name: contact.name },
    });

    // Send notification email to admin
    await sendEmail({
      email: process.env.ADMIN_EMAIL as string,
      subject: 'New Contact Form Submission',
      template: 'contact-admin-notification',
      data: {
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        message: contact.message,
      },
    });

    res.status(201).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all contact submissions
// @route   GET /api/contact
// @access  Private/Admin
export const getContacts = async (req: any, res: Response, next: NextFunction) => {
  try {
    const contacts = await Contact.find().sort('-createdAt');

    res.status(200).json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single contact submission
// @route   GET /api/contact/:id
// @access  Private/Admin
export const getContact = async (req: any, res: Response, next: NextFunction) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      const error: CustomError = new Error('Contact submission not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update contact status
// @route   PUT /api/contact/:id
// @access  Private/Admin
export const updateContactStatus = async (req: any, res: Response, next: NextFunction) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { 
        status: req.body.status,
        updatedAt: Date.now(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!contact) {
      const error: CustomError = new Error('Contact submission not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};