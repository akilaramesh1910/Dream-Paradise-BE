import express from 'express';
import {
  createOrder,
  stripeWebhookHandler,
  getOrdersForUser,
  getOrderById,
  updateOrderToDelivered,
} from '../controllers/order.controller';
import { AuthReq } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/role.middleware';

const router = express.Router();

// Stripe webhook needs raw body; we will mount it at /api/orders/webhook separately in server
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhookHandler);

// AuthReqed routes for orders
router.post('/', AuthReq, createOrder);
router.get('/', AuthReq, getOrdersForUser);
router.get('/:id', AuthReq, getOrderById);

// Admin route to mark delivered
router.put('/:id/deliver', AuthReq, isAdmin, updateOrderToDelivered);

export default router;
