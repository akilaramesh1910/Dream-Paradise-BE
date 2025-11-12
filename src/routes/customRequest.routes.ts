import express from 'express';
import { createCustomRequest, getCustomRequests, updateCustomRequest } from '../controllers/customRequest.controller';
import { AuthReq } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/role.middleware';
import { validateContact } from '../middleware/validation.middleware';

const router = express.Router();

router.post('/', validateContact, createCustomRequest);

// admin routes
router.use(AuthReq, isAdmin);
router.get('/', getCustomRequests);
router.put('/:id', updateCustomRequest);

export default router;
