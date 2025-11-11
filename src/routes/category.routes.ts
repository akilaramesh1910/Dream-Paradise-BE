import express from 'express';
import {
  getCategories,
  getCategory,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller';
import { protect } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/role.middleware';
import { validateCategory } from '../middleware/validation.middleware';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategory);
router.get('/slug/:slug', getCategoryBySlug);

// Protected routes (Admin only)
router.post('/', protect, isAdmin, validateCategory, createCategory);
router.put('/:id', protect, isAdmin, validateCategory, updateCategory);
router.delete('/:id', protect, isAdmin, deleteCategory);

export default router;