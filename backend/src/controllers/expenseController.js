import Expense from '../models/Expense.js';
import BankAccount from '../models/BankAccount.js';
import Category from '../models/Category.js';
import { asyncHandler, createError } from '../middleware/error.js';
import { getMonthBounds, getYearBounds, currentMonth } from '../utils/helpers.js';

// Validates that the given category slug belongs to the user
const validateCategory = async (userId, slug) => {
  const cat = await Category.findOne({ userId, slug });
  if (!cat) throw createError(`Category "${slug}" does not exist`, 400);
};

export const createExpense = asyncHandler(async (req, res) => {
  const { amount, category, date, note, isRecurring, accountId } = req.body;

  await validateCategory(req.user.id, category);

  const expenseData = {
    userId: req.user.id,
    amount,
    category,
    date: date || new Date(),
    note,
    isRecurring: isRecurring || false,
    accountId: accountId || null,
  };

  if (isRecurring) {
    const d = new Date(date || new Date());
    expenseData.recurringDay = Math.min(d.getDate(), 28);
  }

  const expense = await Expense.create(expenseData);

  let updatedAccount = null;
  if (accountId) {
    updatedAccount = await BankAccount.findOneAndUpdate(
      { _id: accountId, userId: req.user.id },
      { $inc: { balance: -amount } },
      { new: true }
    );
    if (!updatedAccount) throw createError('Account not found', 404);
  }

  res.status(201).json({ success: true, expense, account: updatedAccount });
});

export const getExpenses = asyncHandler(async (req, res) => {
  const { month = currentMonth(), category } = req.query;
  const { start, end } = getMonthBounds(month);

  const filter = { userId: req.user.id, date: { $gte: start, $lte: end } };
  if (category) filter.category = category;

  const expenses = await Expense.find(filter).sort({ date: -1 });
  res.json({ success: true, expenses, count: expenses.length });
});

export const getYearlyExpenses = asyncHandler(async (req, res) => {
  const { year } = req.params;
  const { start, end } = getYearBounds(year);

  const expenses = await Expense.find({
    userId: req.user.id,
    date: { $gte: start, $lte: end },
  }).sort({ date: -1 });

  res.json({ success: true, expenses, count: expenses.length, year: parseInt(year) });
});

export const updateExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOne({ _id: req.params.id, userId: req.user.id });
  if (!expense) throw createError('Expense not found', 404);

  const { amount, category, date, note, isRecurring, accountId } = req.body;

  if (category !== undefined) await validateCategory(req.user.id, category);

  const oldAmount = expense.amount;
  const oldAccountId = expense.accountId?.toString() || null;
  const newAccountId = accountId !== undefined ? (accountId || null) : oldAccountId;
  const newAmount = amount !== undefined ? amount : oldAmount;

  // Apply account balance adjustments based on the switching matrix
  if (oldAccountId && newAccountId && oldAccountId === newAccountId && oldAmount !== newAmount) {
    // Same account, amount changed
    await BankAccount.findOneAndUpdate(
      { _id: oldAccountId, userId: req.user.id },
      { $inc: { balance: oldAmount - newAmount } }
    );
  } else if (oldAccountId && newAccountId && oldAccountId !== newAccountId) {
    // Switched accounts
    await BankAccount.findOneAndUpdate({ _id: oldAccountId, userId: req.user.id }, { $inc: { balance: oldAmount } });
    await BankAccount.findOneAndUpdate({ _id: newAccountId, userId: req.user.id }, { $inc: { balance: -newAmount } });
  } else if (oldAccountId && !newAccountId) {
    // Removed account link
    await BankAccount.findOneAndUpdate({ _id: oldAccountId, userId: req.user.id }, { $inc: { balance: oldAmount } });
  } else if (!oldAccountId && newAccountId) {
    // Added account link
    await BankAccount.findOneAndUpdate({ _id: newAccountId, userId: req.user.id }, { $inc: { balance: -newAmount } });
  }

  if (amount !== undefined) expense.amount = amount;
  if (category !== undefined) expense.category = category;
  if (date !== undefined) expense.date = date;
  if (note !== undefined) expense.note = note;
  if (accountId !== undefined) expense.accountId = accountId || null;
  if (isRecurring !== undefined) {
    expense.isRecurring = isRecurring;
    if (isRecurring && expense.date) {
      expense.recurringDay = Math.min(new Date(expense.date).getDate(), 28);
    }
  }

  await expense.save();
  res.json({ success: true, expense });
});

export const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOne({ _id: req.params.id, userId: req.user.id });
  if (!expense) throw createError('Expense not found', 404);

  // Restore account balance before deleting
  if (expense.accountId) {
    await BankAccount.findOneAndUpdate(
      { _id: expense.accountId, userId: req.user.id },
      { $inc: { balance: expense.amount } }
    );
  }

  await expense.deleteOne();
  res.json({ success: true, message: 'Expense deleted' });
});
