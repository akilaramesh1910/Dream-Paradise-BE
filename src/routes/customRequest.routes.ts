import express from 'express';
import { createCustomRequest, getCustomRequests, updateCustomRequest } from '../controllers/customRequest.controller';
import { protect } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/role.middleware';
import { validateContact } from '../middleware/validation.middleware';

const router = express.Router();

router.post('/', validateContact, createCustomRequest);

// admin routes
router.use(protect, isAdmin);
router.get('/', getCustomRequests);
router.put('/:id', updateCustomRequest);

export default router;
