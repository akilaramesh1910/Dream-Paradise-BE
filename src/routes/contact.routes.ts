import express from 'express';
import {
  submitContact,
  getContacts,
  getContact,
  updateContactStatus,
} from '../controllers/contact.controller';
import { AuthReq } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/role.middleware';
import { validateContact } from '../middleware/validation.middleware';

const router = express.Router();

// Public routes
router.post('/', validateContact, submitContact);

// AuthReqed admin routes
router.use(AuthReq, isAdmin);

router.get('/', getContacts);
router.route('/:id')
  .get(getContact)
  .put(updateContactStatus);

export default router;