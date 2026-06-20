import Category, { toSlug, DEFAULT_CATEGORIES } from '../models/Category.js';
import Expense from '../models/Expense.js';
import { asyncHandler, createError } from '../middleware/error.js';

export const seedDefaultCategories = async (userId) => {
  const docs = DEFAULT_CATEGORIES.map((c) => ({ ...c, userId }));
  await Category.insertMany(docs, { ordered: false }).catch(() => {});
};

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ userId: req.user.id }).sort({ order: 1, createdAt: 1 });
  res.json({ success: true, categories });
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, icon, color, order } = req.body;
  const slug = toSlug(name);

  if (!slug) throw createError('Category name produces an invalid slug', 400);

  const existing = await Category.findOne({ userId: req.user.id, slug });
  if (existing) throw createError(`A category with slug "${slug}" already exists`, 409);

  const category = await Category.create({
    userId: req.user.id,
    name,
    slug,
    icon: icon || '📦',
    color: color || '#94a3b8',
    order: order ?? 99,
  });

  res.status(201).json({ success: true, category });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ _id: req.params.id, userId: req.user.id });
  if (!category) throw createError('Category not found', 404);

  const { name, icon, color, order } = req.body;

  if (name !== undefined) category.name = name;
  if (icon !== undefined) category.icon = icon;
  if (color !== undefined) category.color = color;
  if (order !== undefined) category.order = order;

  await category.save();
  res.json({ success: true, category });
});

export const toggleCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ _id: req.params.id, userId: req.user.id });
  if (!category) throw createError('Category not found', 404);

  category.isActive = !category.isActive;
  await category.save();
  res.json({ success: true, category });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ _id: req.params.id, userId: req.user.id });
  if (!category) throw createError('Category not found', 404);

  const count = await Category.countDocuments({ userId: req.user.id });
  if (count <= 1) throw createError('Cannot delete the last remaining category', 400);

  const expenseCount = await Expense.countDocuments({ userId: req.user.id, category: category.slug });
  if (expenseCount > 0) {
    throw createError(
      `Cannot delete — ${expenseCount} expense(s) use this category. Reassign or delete them first.`,
      409
    );
  }

  await category.deleteOne();
  res.json({ success: true, message: 'Category deleted' });
});
