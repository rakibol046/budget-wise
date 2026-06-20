import { create } from 'zustand';
import {
  getCategories,
  createCategory as apiCreate,
  updateCategory as apiUpdate,
  toggleCategory as apiToggle,
  deleteCategory as apiDelete,
} from '../services/category.js';
import toast from 'react-hot-toast';

const useCategoryStore = create((set, get) => ({
  categories: [],
  loading: false,

  init: async () => {
    if (get().categories.length > 0) return;
    set({ loading: true });
    try {
      const res = await getCategories();
      set({ categories: res.data.categories, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchCategories: async () => {
    set({ loading: true });
    try {
      const res = await getCategories();
      set({ categories: res.data.categories, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addCategory: async (data) => {
    try {
      const res = await apiCreate(data);
      set((state) => ({ categories: [...state.categories, res.data.category] }));
      toast.success('Category created!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create category');
      return false;
    }
  },

  editCategory: async (id, data) => {
    try {
      const res = await apiUpdate(id, data);
      set((state) => ({
        categories: state.categories.map((c) => (c._id === id ? res.data.category : c)),
      }));
      toast.success('Category updated!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update category');
      return false;
    }
  },

  toggleActive: async (id) => {
    try {
      const res = await apiToggle(id);
      set((state) => ({
        categories: state.categories.map((c) => (c._id === id ? res.data.category : c)),
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle category');
    }
  },

  removeCategory: async (id) => {
    const prev = get().categories;
    set((state) => ({ categories: state.categories.filter((c) => c._id !== id) }));
    try {
      await apiDelete(id);
      toast.success('Category deleted');
    } catch (err) {
      set({ categories: prev });
      toast.error(err.response?.data?.message || 'Failed to delete category');
    }
  },

  getCategoryBySlug: (slug) => get().categories.find((c) => c.slug === slug),
}));

export default useCategoryStore;
