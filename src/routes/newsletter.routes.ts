import express from 'express';
import { subscribe, unsubscribe } from '../controllers/newsletter.controller';
import { validateNewsletter } from '../middleware/validation.middleware';

const router = express.Router();

router.post('/subscribe', validateNewsletter, subscribe);
router.post('/unsubscribe', validateNewsletter, unsubscribe);

export default router;