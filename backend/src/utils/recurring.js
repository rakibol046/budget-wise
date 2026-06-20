import Expense from '../models/Expense.js';
import { getMonthBounds, getDaysInMonth, parseMonth } from './helpers.js';

/**
 * Auto-inserts recurring expense instances for a given month if they don't exist yet.
 * Called on user login so recurring expenses are always up to date.
 * Returns the count of newly inserted expenses.
 */
export const addMissingRecurring = async (userId, monthStr) => {
  const { start, end } = getMonthBounds(monthStr);
  const { year, month } = parseMonth(monthStr);
  const totalDays = getDaysInMonth(year, month);
  const now = new Date();

  // Get all recurring templates belonging to this user
  const templates = await Expense.find({ userId, isRecurring: true, recurringDay: { $exists: true, $ne: null } });

  if (!templates.length) return 0;

  let inserted = 0;

  for (const template of templates) {
    const day = template.recurringDay;

    // Don't add future dates in the current month
    const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month;
    if (isCurrentMonth && day > now.getDate()) continue;

    // Cap day at month's total days (handles Feb edge case)
    const safeDay = Math.min(day, totalDays);
    const targetDate = new Date(year, month - 1, safeDay);

    // Check if instance already exists for this month+day
    const exists = await Expense.findOne({
      userId,
      category: template.category,
      amount: template.amount,
      date: { $gte: start, $lte: end },
      recurringDay: day,
    });

    if (!exists) {
      await Expense.create({
        userId,
        amount: template.amount,
        category: template.category,
        date: targetDate,
        note: template.note ? `[Recurring] ${template.note}` : '[Recurring]',
        isRecurring: false, // instance is not itself a template
        recurringDay: day,
      });
      inserted++;
    }
  }

  return inserted;
};
