import { Router } from 'express';
import { getAccounts, createAccount, updateAccount, deleteAccount, adjustBalance } from '../controllers/accountController.js';
import { protect } from '../middleware/auth.js';
import { accountRules, validate } from '../middleware/validation.js';

const router = Router();

router.get('/', protect, getAccounts);
router.post('/', protect, accountRules, validate, createAccount);
router.put('/:id', protect, updateAccount);
router.delete('/:id', protect, deleteAccount);
router.post('/:id/adjust', protect, adjustBalance);

export default router;
