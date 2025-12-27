import express from 'express';
import { createPaymentIntent, confirmPayment, createRazorpayOrder, verifyRazorpayPayment } from '../controllers/payment.controller';
import { AuthReq } from '../middleware/auth.middleware';

const router = express.Router();

// Public route for creating payment intent
router.post('/create-payment-intent', createPaymentIntent);

// Authenticated route for confirming payment
router.post('/confirm-payment', AuthReq, confirmPayment);

// Razorpay Routes
router.post('/razorpay/create-order', createRazorpayOrder);
router.post('/razorpay/verify-payment', verifyRazorpayPayment);

export default router;
