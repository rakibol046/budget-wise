import mongoose from 'mongoose';

const currencySchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    code:     { type: String, required: true, uppercase: true, trim: true, unique: true, maxlength: 5 },
    symbol:   { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const DEFAULT_CURRENCIES = [
  { name: 'Bangladeshi Taka',  code: 'BDT', symbol: '৳' },
  { name: 'US Dollar',         code: 'USD', symbol: '$' },
  { name: 'Indian Rupee',      code: 'INR', symbol: '₹' },
  { name: 'Euro',              code: 'EUR', symbol: '€' },
  { name: 'British Pound',     code: 'GBP', symbol: '£' },
  { name: 'Canadian Dollar',   code: 'CAD', symbol: 'C$' },
  { name: 'Australian Dollar', code: 'AUD', symbol: 'A$' },
  { name: 'Japanese Yen',      code: 'JPY', symbol: '¥' },
];

const Currency = mongoose.model('Currency', currencySchema);
export default Currency;
