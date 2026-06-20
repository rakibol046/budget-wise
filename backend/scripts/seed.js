/**
 * Seed script — run with: npm run seed
 * Creates demo user, budgets, and 40+ expenses for May & June 2026.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Budget from '../src/models/Budget.js';
import Expense from '../src/models/Expense.js';

if (process.env.NODE_ENV === 'production') {
  console.error('❌ Seed script cannot run in production');
  process.exit(1);
}

const DEMO_EMAIL = 'demo@budget.app';
const DEMO_PASSWORD = 'Demo@12345';

const budgets = [
  {
    month: '2026-05',
    categories: { groceries: 8000, utilities: 3000, daily: 5000, transport: 4000, others: 2000 },
  },
  {
    month: '2026-06',
    categories: { groceries: 9000, utilities: 3500, daily: 6000, transport: 4500, others: 2500 },
  },
];

const makeDate = (yyyy, mm, dd) => new Date(yyyy, mm - 1, dd);

const expenses = (userId) => [
  // May 2026
  { userId, amount: 1200, category: 'groceries', date: makeDate(2026, 5, 1), note: 'Weekly vegetables & fruits' },
  { userId, amount: 450, category: 'transport', date: makeDate(2026, 5, 2), note: 'Monthly metro pass', isRecurring: true, recurringDay: 2 },
  { userId, amount: 320, category: 'daily', date: makeDate(2026, 5, 3), note: 'Lunch & coffee' },
  { userId, amount: 1800, category: 'utilities', date: makeDate(2026, 5, 5), note: 'Electricity bill', isRecurring: true, recurringDay: 5 },
  { userId, amount: 650, category: 'groceries', date: makeDate(2026, 5, 7), note: 'Dairy & eggs' },
  { userId, amount: 280, category: 'daily', date: makeDate(2026, 5, 8), note: 'Breakfast outing' },
  { userId, amount: 900, category: 'others', date: makeDate(2026, 5, 10), note: 'Medicine & pharmacy' },
  { userId, amount: 1500, category: 'groceries', date: makeDate(2026, 5, 12), note: 'Weekly grocery haul' },
  { userId, amount: 750, category: 'utilities', date: makeDate(2026, 5, 14), note: 'Internet & cable' },
  { userId, amount: 420, category: 'transport', date: makeDate(2026, 5, 15), note: 'Cab rides' },
  { userId, amount: 1100, category: 'daily', date: makeDate(2026, 5, 16), note: 'Dinner with friends' },
  { userId, amount: 350, category: 'groceries', date: makeDate(2026, 5, 18), note: 'Spices & condiments' },
  { userId, amount: 2200, category: 'others', date: makeDate(2026, 5, 20), note: 'Clothing purchase' },
  { userId, amount: 800, category: 'groceries', date: makeDate(2026, 5, 22), note: 'Snacks & beverages' },
  { userId, amount: 600, category: 'daily', date: makeDate(2026, 5, 24), note: 'Movie & popcorn' },
  { userId, amount: 1300, category: 'groceries', date: makeDate(2026, 5, 26), note: 'Weekend market run' },
  { userId, amount: 400, category: 'transport', date: makeDate(2026, 5, 28), note: 'Fuel top-up' },
  { userId, amount: 500, category: 'daily', date: makeDate(2026, 5, 30), note: 'Takeaway dinner' },
  { userId, amount: 1200, category: 'utilities', date: makeDate(2026, 5, 31), note: 'Water & gas bill', isRecurring: true, recurringDay: 28 },

  // June 2026
  { userId, amount: 1400, category: 'groceries', date: makeDate(2026, 6, 1), note: 'Monthly bulk groceries' },
  { userId, amount: 450, category: 'transport', date: makeDate(2026, 6, 2), note: 'Metro pass renewal', isRecurring: false },
  { userId, amount: 1900, category: 'utilities', date: makeDate(2026, 6, 5), note: 'Electricity — summer surge', isRecurring: false },
  { userId, amount: 380, category: 'daily', date: makeDate(2026, 6, 6), note: 'Breakfast & coffee' },
  { userId, amount: 700, category: 'groceries', date: makeDate(2026, 6, 8), note: 'Fruits & dairy' },
  { userId, amount: 1600, category: 'others', date: makeDate(2026, 6, 9), note: 'Books & stationery' },
  { userId, amount: 950, category: 'daily', date: makeDate(2026, 6, 10), note: 'Team lunch' },
  { userId, amount: 550, category: 'transport', date: makeDate(2026, 6, 11), note: 'Airport cab' },
  { userId, amount: 1250, category: 'groceries', date: makeDate(2026, 6, 13), note: 'Mid-month groceries' },
  { userId, amount: 800, category: 'utilities', date: makeDate(2026, 6, 14), note: 'Internet bill' },
  { userId, amount: 750, category: 'daily', date: makeDate(2026, 6, 15), note: 'Date night dinner' },
  { userId, amount: 300, category: 'groceries', date: makeDate(2026, 6, 17), note: 'Bread & cereals' },
  { userId, amount: 2100, category: 'others', date: makeDate(2026, 6, 18), note: 'Online subscription yearly' },
  { userId, amount: 480, category: 'transport', date: makeDate(2026, 6, 19), note: 'Weekly commute' },
  { userId, amount: 900, category: 'groceries', date: makeDate(2026, 6, 20), note: 'Weekend market' },
  { userId, amount: 650, category: 'daily', date: makeDate(2026, 6, 20), note: 'Cafe & snacks' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Drop existing data
    await Promise.all([User.deleteMany({}), Budget.deleteMany({}), Expense.deleteMany({})]);
    console.log('🗑️  Cleared existing data');

    // Create demo user
    const user = await User.create({ name: 'Demo User', email: DEMO_EMAIL, password: DEMO_PASSWORD });
    console.log(`👤 Created user: ${DEMO_EMAIL}`);

    // Create budgets
    const budgetDocs = budgets.map((b) => ({ ...b, userId: user._id }));
    await Budget.insertMany(budgetDocs);
    console.log(`💰 Created ${budgets.length} budget entries`);

    // Create expenses
    const expenseDocs = expenses(user._id);
    await Expense.insertMany(expenseDocs);
    console.log(`🧾 Created ${expenseDocs.length} expense entries`);

    console.log('\n✅ Seeding complete!');
    console.log(`\n  Login credentials:`);
    console.log(`    Email:    ${DEMO_EMAIL}`);
    console.log(`    Password: ${DEMO_PASSWORD}`);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
