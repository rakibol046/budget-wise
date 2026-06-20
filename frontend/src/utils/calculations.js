// Default fallback category data — used when categoryStore hasn't loaded yet
export const DEFAULT_CATEGORIES = [
  { slug: 'groceries', name: 'Groceries', icon: '🛒', color: '#4fd1c5' },
  { slug: 'utilities', name: 'Utilities', icon: '⚡', color: '#f59e0b' },
  { slug: 'daily',     name: 'Daily',     icon: '☕', color: '#818cf8' },
  { slug: 'transport', name: 'Transport', icon: '🚌', color: '#34d399' },
  { slug: 'others',    name: 'Others',    icon: '📦', color: '#f87171' },
];

// Look up a category from the list by slug, falling back to a neutral default
export const getCategoryBySlug = (categories, slug) =>
  categories.find((c) => c.slug === slug) || { slug, name: slug, icon: '📦', color: '#94a3b8' };

// Groups expenses by category and sums amounts
// categories = [{ slug, name, icon, color }]
export const groupByCategory = (expenses, categories = DEFAULT_CATEGORIES) => {
  const totals = {};
  categories.forEach((c) => { totals[c.slug] = 0; });
  expenses.forEach((e) => {
    if (totals[e.category] !== undefined) totals[e.category] += e.amount;
    else totals['__other__'] = (totals['__other__'] || 0) + e.amount;
  });

  return categories
    .map((cat) => ({ name: cat.name, value: totals[cat.slug] || 0, fill: cat.color, slug: cat.slug }))
    .filter((d) => d.value > 0);
};

// Groups expenses by week-of-month for bar chart
export const groupByWeek = (expenses, categories = DEFAULT_CATEGORIES) => {
  const weeks = {};
  expenses.forEach((e) => {
    const d = new Date(e.date);
    const weekNum = Math.ceil(d.getDate() / 7);
    const key = `Week ${weekNum}`;
    if (!weeks[key]) {
      const base = { week: key };
      categories.forEach((c) => { base[c.slug] = 0; });
      weeks[key] = base;
    }
    if (weeks[key][e.category] !== undefined) {
      weeks[key][e.category] += e.amount;
    }
  });
  return Object.values(weeks).sort((a, b) => {
    return parseInt(a.week.split(' ')[1]) - parseInt(b.week.split(' ')[1]);
  });
};

// Groups a year's expenses by month (returns 12 entries)
export const groupByMonth = (expenses) => {
  const months = Array.from({ length: 12 }, (_, i) => ({
    label: new Date(2000, i, 1).toLocaleString('default', { month: 'short' }),
    monthIndex: i,
    spent: 0,
    budget: 0,
    savings: 0,
  }));

  expenses.forEach((e) => {
    const m = new Date(e.date).getMonth(); // 0-indexed
    months[m].spent += e.amount;
  });

  return months;
};

// Groups multiple years of expenses into annual totals
export const groupByYear = (expensesByYear) => {
  return Object.entries(expensesByYear)
    .map(([year, expenses]) => ({
      label: year,
      spent: expenses.reduce((s, e) => s + e.amount, 0),
      budget: 0,
      savings: 0,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

// Returns color based on spending percentage
export const getWarningColor = (percentage) => {
  if (percentage >= 80) return '#f87171';
  if (percentage >= 60) return '#f59e0b';
  return '#34d399';
};

export const getWarningLevel = (percentage) => {
  if (percentage >= 80) return 'danger';
  if (percentage >= 60) return 'warning';
  return 'safe';
};
