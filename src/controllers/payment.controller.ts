import { Request, Response } from 'express';
import Stripe from 'stripe';
import Payment from '../models/payment.model';

// Initialize Stripe - remove apiVersion or use supported version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const createPaymentIntent = async (req: Request, res: Response) => {
    try {
        const { amount, currency, customerEmail, metadata, cartItems, shippingDetails } = req.body;

        if (!amount || !currency) {
            return res.status(400).json({ error: 'Amount and currency are required' });
        }

        // Create PaymentIntent with Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to paise
            currency: currency,
            receipt_email: customerEmail,
            metadata: metadata || {},
            automatic_payment_methods: {
                enabled: true,
            },
        });

        // Save payment record to database
        const payment = await Payment.create({
            paymentIntentId: paymentIntent.id,
            amount: amount,
            currency: currency,
            status: 'pending',
            customerEmail: customerEmail,
            customerName: metadata?.customerName,
            shippingDetails: shippingDetails,
            cartItems: cartItems || [],
            metadata: metadata,
            stripeResponse: paymentIntent,
        });

        res.status(200).json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            paymentId: payment._id,
        });
    } catch (error: any) {
        console.error('Payment Intent Error:', error);
        res.status(500).json({
            error: 'Failed to create payment intent',
            message: error.message
        });
    }
};

export const confirmPayment = async (req: Request, res: Response) => {
    try {
        const { paymentIntentId } = req.body;

        if (!paymentIntentId) {
            return res.status(400).json({ error: 'Payment Intent ID is required' });
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        await Payment.findOneAndUpdate(
            { paymentIntentId: paymentIntentId },
            {
                status: paymentIntent.status as any,
                stripeResponse: paymentIntent,
            },
            { new: true }
        );

        res.status(200).json({
            status: paymentIntent.status,
            paymentIntent,
        });
    } catch (error: any) {
        console.error('Payment Confirmation Error:', error);
        res.status(500).json({
            error: 'Failed to confirm payment',
            message: error.message
        });
    }
};
