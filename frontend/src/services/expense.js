import api from './api.js';
import Papa from 'papaparse';
import { format } from 'date-fns';

export const createExpense = (data) => api.post('/expenses', data);
export const getExpenses = (params) => api.get('/expenses', { params });
export const getYearlyExpenses = (year) => api.get(`/expenses/yearly/${year}`);
export const updateExpense = (id, data) => api.put(`/expenses/${id}`, data);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);

export const exportExpensesCSV = (expenses, month) => {
  const rows = expenses.map((e) => ({
    Date: format(new Date(e.date), 'yyyy-MM-dd'),
    Category: e.category,
    Amount: e.amount,
    Note: e.note || '',
    Recurring: e.isRecurring ? 'Yes' : 'No',
    Account: e.accountId || '',
  }));
  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `expenses-${month}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};
