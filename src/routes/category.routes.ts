import express from 'express';
import {
  getCategories,
  getCategory,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller';
import { AuthReq } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/role.middleware';
import { validateCategory } from '../middleware/validation.middleware';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategory);
router.get('/slug/:slug', getCategoryBySlug);

// AuthReqed routes (Admin only)
router.post('/', AuthReq, isAdmin, validateCategory, createCategory);
router.put('/:id', AuthReq, isAdmin, validateCategory, updateCategory);
router.delete('/:id', AuthReq, isAdmin, deleteCategory);

export default router;