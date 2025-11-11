import express from 'express';
import {
  createOrder,
  stripeWebhookHandler,
  getOrdersForUser,
  getOrderById,
  updateOrderToDelivered,
} from '../controllers/order.controller';
import { protect } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/role.middleware';

const router = express.Router();

// Stripe webhook needs raw body; we will mount it at /api/orders/webhook separately in server
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhookHandler);

// Protected routes for orders
router.post('/', protect, createOrder);
router.get('/', protect, getOrdersForUser);
router.get('/:id', protect, getOrderById);

// Admin route to mark delivered
router.put('/:id/deliver', protect, isAdmin, updateOrderToDelivered);

export default router;
