import { Request, Response, NextFunction } from 'express';
import Contact from '../models/contact.model';
import { sendEmail } from '../utils/email';
import { CustomError } from '../middleware/error.middleware';

type AuthUser = { id: string; role?: string };

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public

export const submitContact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('===== CONTACT API HIT =====');
    console.log('Request Body:', req.body);

    const contact = await Contact.create(req.body);

    console.log('Contact saved to DB:', contact);

    console.log('===== EMAIL ENV CHECK =====');
    console.log('SMTP_HOST:', process.env.SMTP_HOST);
    console.log('SMTP_PORT:', process.env.SMTP_PORT);
    console.log('SMTP_USER:', process.env.SMTP_USER);
    console.log('SMTP_PASS exists:', !!process.env.SMTP_PASS);
    console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL);

    // Send auto-reply email to user
    console.log('===== SENDING USER EMAIL =====');

    await sendEmail({
      email: contact.email,
      subject: 'Thank you for contacting us',
      template: 'contact-auto-reply',
      data: { name: contact.name },
    });

    console.log('User email sent successfully');

    // Send notification email to admin
    console.log('===== SENDING ADMIN EMAIL =====');

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

    console.log('Admin email sent successfully');

    res.status(201).json({
      success: true,
      data: contact,
    });
  } catch (error: any) {
    console.log('===== CONTACT API ERROR =====');
    console.log(error);
    console.log('Error Message:', error.message);
    console.log('Stack:', error.stack);

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