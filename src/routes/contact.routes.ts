import express from 'express';
import {
  submitContact,
  getContacts,
  getContact,
  updateContactStatus,
} from '../controllers/contact.controller';
import { protect } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/role.middleware';
import { validateContact } from '../middleware/validation.middleware';

const router = express.Router();

// Public routes
router.post('/', validateContact, submitContact);

// Protected admin routes
router.use(protect, isAdmin);

router.get('/', getContacts);
router.route('/:id')
  .get(getContact)
  .put(updateContactStatus);

export default router;