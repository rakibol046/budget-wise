import { Router } from 'express';
import { setBudget, getBudget, getBudgetInsights } from '../controllers/budgetController.js';
import { protect } from '../middleware/auth.js';
import { budgetRules, monthParamRules, validate } from '../middleware/validation.js';

const router = Router();

router.post('/set', protect, budgetRules, validate, setBudget);

// Insights route MUST come before /:month to avoid Express swallowing "insights" as a param
router.get('/insights/:month', protect, monthParamRules, validate, getBudgetInsights);
router.get('/:month', protect, monthParamRules, validate, getBudget);

export default router;
