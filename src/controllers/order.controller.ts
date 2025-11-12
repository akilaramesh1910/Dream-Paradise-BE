import { Request, Response, NextFunction } from 'express';
import Order from '../models/order.model';
import Product from '../models/product.model';
import { stripe, createPaymentIntent } from '../utils/stripe';
import { CustomError } from '../middleware/error.middleware';

type AuthUser = { id: string; role?: string };
type AuthRequest = Request & { user: AuthUser };

// @desc Create an order (and optionally create Stripe PaymentIntent)
// @route POST /api/orders
// @access Private
export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode, discountAmount } = req.body;

    if (!items || items.length === 0) {
      const err: CustomError = new Error('No order items');
      err.statusCode = 400;
      throw err;
    }

    // Calculate prices server-side for integrity
    const itemsPrice = items.reduce((acc: number, item: any) => acc + item.quantity * item.price, 0);
    const taxPrice = parseFloat((itemsPrice * 0.1).toFixed(2)); // example: 10% tax
    const shippingPrice = 0; // placeholder
    const totalPrice = itemsPrice + taxPrice + shippingPrice - (discountAmount || 0);

    const order = await Order.create({
      user: req.user.id,
      items,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      couponCode,
      discountAmount: discountAmount || 0,
    });

    // If payment method is stripe, create PaymentIntent
    if (paymentMethod === 'stripe') {
      const paymentIntent = await createPaymentIntent(totalPrice, 'usd', { orderId: order._id.toString() });
      return res.status(201).json({ success: true, data: order, clientSecret: paymentIntent.client_secret });
    }

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc Handle Stripe webhook (payment success)
// @route POST /api/orders/webhook
// @access Public (Stripe)
export const stripeWebhookHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sig = req.headers['stripe-signature'] as string | undefined;
    const rawBody = (req as any).rawBody as Buffer; // server must set rawBody
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

    if (!webhookSecret) {
      return res.status(500).send('Webhook secret not configured');
    }

    const event = stripe.webhooks.constructEvent(rawBody, sig as string, webhookSecret);

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as any;
      const orderId = paymentIntent.metadata?.orderId;
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, { isPaid: true, paidAt: new Date(), paymentResult: paymentIntent });
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error', error);
    res.status(400).send(`Webhook Error: ${(error as Error).message}`);
  }
};

// @desc Get orders for user
// @route GET /api/orders
// @access Private
export const getOrdersForUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort('-createdAt');
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

// @desc Get single order
// @route GET /api/orders/:id
// @access Private
export const getOrderById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      const err: CustomError = new Error('Order not found');
      err.statusCode = 404;
      throw err;
    }
    // ensure user owns the order or is admin
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      const err: CustomError = new Error('Not authorized to view this order');
      err.statusCode = 401;
      throw err;
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc Update order to delivered (admin)
// @route PUT /api/orders/:id/deliver
// @access Private/Admin
export const updateOrderToDelivered = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      const err: CustomError = new Error('Order not found');
      err.statusCode = 404;
      throw err;
    }

    order.isDelivered = true;
    order.deliveredAt = new Date();
    await order.save();

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};
