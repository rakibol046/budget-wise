import BankAccount from '../models/BankAccount.js';
import Expense from '../models/Expense.js';
import { asyncHandler, createError } from '../middleware/error.js';

export const getAccounts = asyncHandler(async (req, res) => {
  const accounts = await BankAccount.find({ userId: req.user.id }).sort({ isDefault: -1, createdAt: 1 });
  const netWorth = accounts.reduce((sum, a) => sum + a.balance, 0);
  res.json({ success: true, accounts, netWorth });
});

export const createAccount = asyncHandler(async (req, res) => {
  const { name, bankName, accountType, balance, currency, color, icon, isDefault } = req.body;

  if (isDefault) {
    // Unset current default
    await BankAccount.updateMany({ userId: req.user.id, isDefault: true }, { isDefault: false });
  }

  const account = await BankAccount.create({
    userId: req.user.id,
    name,
    bankName,
    accountType,
    balance: balance || 0,
    currency: currency || req.user.currency || 'INR',
    color,
    icon,
    isDefault: isDefault || false,
  });

  res.status(201).json({ success: true, account });
});

export const updateAccount = asyncHandler(async (req, res) => {
  const account = await BankAccount.findOne({ _id: req.params.id, userId: req.user.id });
  if (!account) throw createError('Account not found', 404);

  const { name, bankName, accountType, currency, color, icon, isDefault } = req.body;

  if (isDefault && !account.isDefault) {
    await BankAccount.updateMany({ userId: req.user.id, isDefault: true }, { isDefault: false });
  }

  if (name !== undefined) account.name = name;
  if (bankName !== undefined) account.bankName = bankName;
  if (accountType !== undefined) account.accountType = accountType;
  if (currency !== undefined) account.currency = currency;
  if (color !== undefined) account.color = color;
  if (icon !== undefined) account.icon = icon;
  if (isDefault !== undefined) account.isDefault = isDefault;

  await account.save();
  res.json({ success: true, account });
});

export const deleteAccount = asyncHandler(async (req, res) => {
  const account = await BankAccount.findOne({ _id: req.params.id, userId: req.user.id });
  if (!account) throw createError('Account not found', 404);

  const expenseCount = await Expense.countDocuments({ userId: req.user.id, accountId: account._id });
  if (expenseCount > 0) {
    throw createError(
      `Cannot delete — ${expenseCount} expense(s) are linked to this account. Unlink them first.`,
      409
    );
  }

  await account.deleteOne();
  res.json({ success: true, message: 'Account deleted' });
});

export const adjustBalance = asyncHandler(async (req, res) => {
  const { type, amount, note } = req.body;
  if (!['add', 'subtract'].includes(type)) throw createError('Type must be "add" or "subtract"', 400);
  if (!amount || amount <= 0) throw createError('Amount must be greater than 0', 400);

  const delta = type === 'add' ? amount : -amount;

  const account = await BankAccount.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { $inc: { balance: delta } },
    { new: true }
  );
  if (!account) throw createError('Account not found', 404);

  res.json({ success: true, account, adjustment: { type, amount, note } });
});
