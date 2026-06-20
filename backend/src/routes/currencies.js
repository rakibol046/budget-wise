import { Router } from 'express';
import { getCurrencies } from '../controllers/currencyController.js';

const router = Router();

// Public — no auth needed
router.get('/', getCurrencies);

export default router;
