import { create } from 'zustand';
import {
  getExpenses,
  getYearlyExpenses,
  createExpense as apiCreate,
  updateExpense as apiUpdate,
  deleteExpense as apiDelete,
} from '../services/expense.js';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const currentMonth = () => format(new Date(), 'yyyy-MM');

const useExpenseStore = create((set, get) => ({
  expenses: [],
  loading: false,
  filters: { month: currentMonth(), category: '' },

  // Yearly expenses cache — keyed by year string
  yearlyExpenses: {},
  yearlyLoading: false,

  setFilter: (key, value) => {
    set((state) => ({ filters: { ...state.filters, [key]: value } }));
  },

  fetchExpenses: async (params) => {
    set({ loading: true });
    try {
      const queryParams = params || get().filters;
      const res = await getExpenses(queryParams);
      set({ expenses: res.data.expenses, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchYearly: async (year) => {
    const yearStr = String(year);
    if (get().yearlyExpenses[yearStr]) return; // cache hit
    set({ yearlyLoading: true });
    try {
      const res = await getYearlyExpenses(yearStr);
      set((state) => ({
        yearlyExpenses: { ...state.yearlyExpenses, [yearStr]: res.data.expenses },
        yearlyLoading: false,
      }));
    } catch {
      set({ yearlyLoading: false });
    }
  },

  addExpense: async (data) => {
    try {
      const res = await apiCreate(data);
      set((state) => ({ expenses: [res.data.expense, ...state.expenses] }));
      toast.success('Expense added!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add expense');
      return false;
    }
  },

  editExpense: async (id, data) => {
    try {
      const res = await apiUpdate(id, data);
      set((state) => ({
        expenses: state.expenses.map((e) => (e._id === id ? res.data.expense : e)),
      }));
      toast.success('Expense updated!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update expense');
      return false;
    }
  },

  removeExpense: async (id) => {
    const prev = get().expenses;
    set((state) => ({ expenses: state.expenses.filter((e) => e._id !== id) }));
    try {
      await apiDelete(id);
      toast.success('Expense deleted');
    } catch (err) {
      set({ expenses: prev });
      toast.error(err.response?.data?.message || 'Failed to delete expense');
    }
  },

  clearExpenses: () => set({ expenses: [], yearlyExpenses: {} }),
}));

export default useExpenseStore;
