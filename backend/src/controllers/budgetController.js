import Budget from '../models/Budget.js';
import Expense from '../models/Expense.js';
import Category from '../models/Category.js';
import { asyncHandler, createError } from '../middleware/error.js';
import { getMonthBounds } from '../utils/helpers.js';
import { computeInsights } from '../services/insightService.js';

export const setBudget = asyncHandler(async (req, res) => {
  const { month, categories } = req.body;

  // Validate all slugs are valid for this user
  const userCategories = await Category.find({ userId: req.user.id });
  const validSlugs = new Set(userCategories.map((c) => c.slug));
  for (const key of Object.keys(categories)) {
    if (!validSlugs.has(key)) {
      throw createError(`Unknown category: "${key}"`, 400);
    }
  }

  const budget = await Budget.findOneAndUpdate(
    { userId: req.user.id, month },
    { userId: req.user.id, month, categories },
    { upsert: true, new: true, runValidators: true }
  );

  res.status(200).json({ success: true, budget });
});

export const getBudget = asyncHandler(async (req, res) => {
  const { month } = req.params;
  const budget = await Budget.findOne({ userId: req.user.id, month });
  res.json({ success: true, budget: budget || null });
});

export const getBudgetInsights = asyncHandler(async (req, res) => {
  const { month } = req.params;

  const [budget, categories] = await Promise.all([
    Budget.findOne({ userId: req.user.id, month }),
    Category.find({ userId: req.user.id }).sort({ order: 1 }),
  ]);

  const { start, end } = getMonthBounds(month);
  const expenses = await Expense.find({
    userId: req.user.id,
    date: { $gte: start, $lte: end },
  });

  const insights = computeInsights(budget, expenses, month, categories);

  res.json({ success: true, insights, budget, expenseCount: expenses.length });
});
