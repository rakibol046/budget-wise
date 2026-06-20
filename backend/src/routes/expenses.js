import { Router } from 'express';
import { createExpense, getExpenses, getYearlyExpenses, updateExpense, deleteExpense } from '../controllers/expenseController.js';
import { protect } from '../middleware/auth.js';
import { expenseRules, monthQueryRules, validate } from '../middleware/validation.js';

const router = Router();

router.post('/', protect, expenseRules, validate, createExpense);
router.get('/', protect, monthQueryRules, validate, getExpenses);

// yearly/:year MUST be registered before /:id
router.get('/yearly/:year', protect, getYearlyExpenses);

router.put('/:id', protect, expenseRules, validate, updateExpense);
router.delete('/:id', protect, deleteExpense);

export default router;
