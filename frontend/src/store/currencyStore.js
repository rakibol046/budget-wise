import { create } from 'zustand';
import { getCurrencies } from '../services/currencies.js';

const useCurrencyStore = create((set, get) => ({
  currencies: [],
  loaded: false,

  fetchCurrencies: async () => {
    if (get().loaded) return;
    try {
      const res = await getCurrencies();
      set({ currencies: res.data.currencies, loaded: true });
    } catch {
      // Fallback to built-in list if API is unreachable
      set({
        currencies: [
          { code: 'BDT', name: 'Bangladeshi Taka',  symbol: '৳' },
          { code: 'USD', name: 'US Dollar',         symbol: '$' },
          { code: 'INR', name: 'Indian Rupee',      symbol: '₹' },
          { code: 'EUR', name: 'Euro',              symbol: '€' },
          { code: 'GBP', name: 'British Pound',     symbol: '£' },
          { code: 'CAD', name: 'Canadian Dollar',   symbol: 'C$' },
          { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
          { code: 'JPY', name: 'Japanese Yen',      symbol: '¥' },
        ],
        loaded: true,
      });
    }
  },
}));

export default useCurrencyStore;
