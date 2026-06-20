import { Router } from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  toggleCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect } from '../middleware/auth.js';
import { categoryRules, validate } from '../middleware/validation.js';

const router = Router();

router.get('/',          protect, getCategories);
router.post('/',         protect, categoryRules, validate, createCategory);
router.put('/:id',       protect, updateCategory);
router.patch('/:id/toggle', protect, toggleCategory);
router.delete('/:id',    protect, deleteCategory);

export default router;
