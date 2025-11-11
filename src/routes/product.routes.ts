import express from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
} from '../controllers/product.controller';
import { protect } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/role.middleware';
import { validateProduct } from '../middleware/validation.middleware';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProduct);

// Protected routes (Admin only)
router.post('/', protect, isAdmin, validateProduct, createProduct);
router.put('/:id', protect, isAdmin, validateProduct, updateProduct);
router.delete('/:id', protect, isAdmin, deleteProduct);

export default router;