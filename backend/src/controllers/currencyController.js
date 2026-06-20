import Currency, { DEFAULT_CURRENCIES } from '../models/Currency.js';
import { asyncHandler } from '../middleware/error.js';

export const seedCurrencies = async () => {
  const count = await Currency.countDocuments();
  if (count === 0) {
    await Currency.insertMany(DEFAULT_CURRENCIES);
    console.log('💱 Default currencies seeded');
  }
};

export const getCurrencies = asyncHandler(async (req, res) => {
  const currencies = await Currency.find({ isActive: true }).sort({ code: 1 });
  res.json({ success: true, currencies });
});
