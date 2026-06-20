import { create } from 'zustand';
import {
  getAccounts,
  createAccount as apiCreate,
  updateAccount as apiUpdate,
  deleteAccount as apiDelete,
  adjustBalance as apiAdjust,
} from '../services/account.js';
import toast from 'react-hot-toast';

const useAccountStore = create((set, get) => ({
  accounts: [],
  netWorth: 0,
  loading: false,

  init: async () => {
    if (get().accounts.length > 0) return;
    await get().fetchAccounts();
  },

  fetchAccounts: async () => {
    set({ loading: true });
    try {
      const res = await getAccounts();
      set({ accounts: res.data.accounts, netWorth: res.data.netWorth, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addAccount: async (data) => {
    try {
      const res = await apiCreate(data);
      set((state) => {
        const accounts = [...state.accounts, res.data.account];
        return { accounts, netWorth: accounts.reduce((s, a) => s + a.balance, 0) };
      });
      toast.success('Account created!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create account');
      return false;
    }
  },

  editAccount: async (id, data) => {
    try {
      const res = await apiUpdate(id, data);
      set((state) => {
        const accounts = state.accounts.map((a) => (a._id === id ? res.data.account : a));
        return { accounts, netWorth: accounts.reduce((s, a) => s + a.balance, 0) };
      });
      toast.success('Account updated!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update account');
      return false;
    }
  },

  removeAccount: async (id) => {
    const prev = get().accounts;
    set((state) => {
      const accounts = state.accounts.filter((a) => a._id !== id);
      return { accounts, netWorth: accounts.reduce((s, a) => s + a.balance, 0) };
    });
    try {
      await apiDelete(id);
      toast.success('Account deleted');
    } catch (err) {
      set({ accounts: prev, netWorth: prev.reduce((s, a) => s + a.balance, 0) });
      toast.error(err.response?.data?.message || 'Failed to delete account');
    }
  },

  adjustBalance: async (id, data) => {
    try {
      const res = await apiAdjust(id, data);
      set((state) => {
        const accounts = state.accounts.map((a) => (a._id === id ? res.data.account : a));
        return { accounts, netWorth: accounts.reduce((s, a) => s + a.balance, 0) };
      });
      toast.success(`Balance ${data.type === 'add' ? 'added' : 'deducted'} successfully`);
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to adjust balance');
      return false;
    }
  },
}));

export default useAccountStore;
