import {
  getDaysInMonth as dateFnsDaysInMonth,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  parseISO,
  format,
} from 'date-fns';

export const getDaysInMonth = (year, month) => {
  return dateFnsDaysInMonth(new Date(year, month - 1, 1));
};

export const getDaysPassed = (year, month) => {
  const now = new Date();
  const total = getDaysInMonth(year, month);
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month;
  return isCurrentMonth ? Math.min(now.getDate(), total) : total;
};

export const getMonthBounds = (monthStr) => {
  const date = parseISO(`${monthStr}-01`);
  return { start: startOfMonth(date), end: endOfMonth(date) };
};

export const getYearBounds = (year) => {
  const date = new Date(parseInt(year), 0, 1);
  return { start: startOfYear(date), end: endOfYear(date) };
};

export const currentMonth = () => format(new Date(), 'yyyy-MM');

export const parseMonth = (monthStr) => {
  const [year, month] = monthStr.split('-').map(Number);
  return { year, month };
};

// Generates a 6-digit numeric OTP string
export const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();
