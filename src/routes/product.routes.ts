import express from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
} from '../controllers/product.controller';
import { AuthReq } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/role.middleware';
import { validateProduct } from '../middleware/validation.middleware';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProduct);

// AuthReqed routes (Admin only)
router.post('/', AuthReq, isAdmin, validateProduct, createProduct);
router.put('/:id', AuthReq, isAdmin, validateProduct, updateProduct);
router.delete('/:id', AuthReq, isAdmin, deleteProduct);

export default router;