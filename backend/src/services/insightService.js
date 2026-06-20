import { getDaysInMonth, getDaysPassed, parseMonth } from '../utils/helpers.js';

/**
 * Pure function — computes all smart insights from budget + expenses data.
 * categories = [{ slug, name, icon, color }] from the user's Category docs.
 */
export const computeInsights = (budget, expenses, monthStr, categories = []) => {
  const { year, month } = parseMonth(monthStr);
  const totalDays = getDaysInMonth(year, month);
  const daysPassed = getDaysPassed(year, month);
  const slugs = categories.map((c) => c.slug);

  // Total budget — sum of all category allocations in the Map
  let totalBudget = 0;
  if (budget) {
    for (const val of budget.categories.values()) {
      totalBudget += val || 0;
    }
  }

  // Spending per category slug
  const byCat = {};
  slugs.forEach((slug) => { byCat[slug] = 0; });
  expenses.forEach((e) => {
    if (byCat[e.category] !== undefined) {
      byCat[e.category] += e.amount;
    } else {
      // Expense belongs to a category not in current list (deleted or unknown)
      byCat['__other__'] = (byCat['__other__'] || 0) + e.amount;
    }
  });

  const totalSpent = Object.values(byCat).reduce((sum, v) => sum + v, 0);
  const remaining = totalBudget - totalSpent;
  const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const dailyAvg = daysPassed > 0 ? totalSpent / daysPassed : 0;
  const predicted = dailyAvg * totalDays;

  // Highest spending category (from known slugs)
  const topCategory = slugs.length
    ? slugs.reduce((top, slug) => (byCat[slug] > (byCat[top] || 0) ? slug : top), slugs[0])
    : null;

  // Per-category breakdown with budget info
  const budgetByCat = budget
    ? slugs.reduce((acc, slug) => {
        const allocated = budget.categories.get(slug) || 0;
        acc[slug] = {
          budget: allocated,
          spent: byCat[slug] || 0,
          remaining: allocated - (byCat[slug] || 0),
          percentage: allocated > 0 ? ((byCat[slug] || 0) / allocated) * 100 : 0,
        };
        return acc;
      }, {})
    : null;

  let warning = 'safe';
  if (percentage >= 80) warning = 'danger';
  else if (percentage >= 60) warning = 'warning';

  return {
    totalBudget,
    totalSpent,
    remaining,
    percentage: Math.round(percentage * 100) / 100,
    dailyAvg: Math.round(dailyAvg * 100) / 100,
    predicted: Math.round(predicted * 100) / 100,
    topCategory,
    warning,
    byCat,
    budgetByCat,
    daysPassed,
    totalDays,
  };
};
