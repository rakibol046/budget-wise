import { format, parseISO, isValid } from 'date-fns';

export const formatCurrency = (amount, currency = 'INR') => {
  const value = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  const cur = currency || 'INR';
  try {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency: cur,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      currencyDisplay: 'narrowSymbol',
    }).format(value);
  } catch {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency: cur,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
};

export const formatDate = (date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '';
  return format(d, 'MMM d, yyyy');
};

export const formatMonth = (monthStr) => {
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-').map(Number);
  const d = new Date(year, month - 1, 1);
  return format(d, 'MMMM yyyy');
};

export const formatPercent = (value) => {
  if (typeof value !== 'number') return '0%';
  return `${Math.min(value, 100).toFixed(1)}%`;
};

export const toInputDate = (date) => {
  const d = date ? new Date(date) : new Date();
  return format(d, 'yyyy-MM-dd');
};
