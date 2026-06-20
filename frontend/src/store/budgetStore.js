import { create } from 'zustand';
import { getBudget, setBudget as apiSetBudget, getBudgetInsights } from '../services/budget.js';
import toast from 'react-hot-toast';

const useBudgetStore = create((set, get) => ({
  budget: null,
  insights: null,
  loading: false,
  insightsLoading: false,

  fetchBudget: async (month) => {
    set({ loading: true });
    try {
      const res = await getBudget(month);
      set({ budget: res.data.budget, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchInsights: async (month) => {
    set({ insightsLoading: true });
    try {
      const res = await getBudgetInsights(month);
      set({ insights: res.data.insights, budget: res.data.budget, insightsLoading: false });
    } catch {
      set({ insightsLoading: false });
    }
  },

  saveBudget: async (month, categories) => {
    set({ loading: true });
    try {
      const res = await apiSetBudget({ month, categories });
      set({ budget: res.data.budget, loading: false });
      toast.success('Budget saved!');
      return true;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to save budget';
      toast.error(message);
      set({ loading: false });
      return false;
    }
  },

  clearBudget: () => set({ budget: null, insights: null }),
}));

export default useBudgetStore;
