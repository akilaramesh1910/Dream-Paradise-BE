import { Request, Response } from 'express';
import Stripe from 'stripe';
import Payment from '../models/payment.model';
import crypto from 'crypto';
// @ts-ignore
import Razorpay from 'razorpay';

// Initialize Stripe - remove apiVersion or use supported version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

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


export const createRazorpayOrder = async (req: Request, res: Response) => {
    try {
        const { amount, currency = 'INR', customerEmail, metadata, cartItems, shippingDetails } = req.body;

        if (!amount) {
            return res.status(400).json({ error: 'Amount is required' });
        }

        const options = {
            amount: Math.round(amount * 100),
            currency,
            receipt: `receipt_${Date.now()}`,
            notes: metadata || {},
        };

        const order = await razorpay.orders.create(options);

        // Save pending payment record to database
        const payment = await Payment.create({
            razorpayOrderId: order.id,
            amount: amount,
            currency: currency,
            status: 'pending',
            customerEmail: customerEmail,
            customerName: metadata?.customerName,
            shippingDetails: shippingDetails,
            cartItems: cartItems || [],
            metadata: metadata,
            provider: 'razorpay',
        });

        res.status(200).json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
            paymentId: payment._id,
        });
    } catch (error: any) {
        console.error('Razorpay Create Order Error:', error);
        res.status(500).json({
            error: 'Failed to create Razorpay order',
            message: error.message
        });
    }
};

export const verifyRazorpayPayment = async (req: Request, res: Response) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ error: 'Missing payment verification details' });
        }

        const body = razorpay_order_id + '|' + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            // Update payment status to succeeded
            await Payment.findOneAndUpdate(
                { razorpayOrderId: razorpay_order_id },
                {
                    status: 'succeeded',
                    razorpayPaymentId: razorpay_payment_id,
                    razorpaySignature: razorpay_signature,
                },
                { new: true }
            );

            res.status(200).json({ status: 'success', message: 'Payment verified successfully' });
        } else {
            await Payment.findOneAndUpdate(
                { razorpayOrderId: razorpay_order_id },
                { status: 'failed' }
            );
            res.status(400).json({ status: 'failure', message: 'Invalid signature' });
        }
    } catch (error: any) {
        console.error('Razorpay Verification Error:', error);
        res.status(500).json({
            error: 'Failed to verify payment',
            message: error.message
        });
    }
};
