import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import connectDB from './src/config/db.js';
import authRoutes from './src/routes/auth.js';
import budgetRoutes from './src/routes/budget.js';
import expenseRoutes from './src/routes/expenses.js';
import categoryRoutes from './src/routes/categories.js';
import accountRoutes from './src/routes/accounts.js';
import currencyRoutes from './src/routes/currencies.js';
import { seedCurrencies } from './src/controllers/currencyController.js';
import { errorHandler } from './src/middleware/error.js';

const app = express();
const PORT = process.env.PORT || 5000;

connectDB().then(() => seedCurrencies());

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use('/api/auth',       authRoutes);
app.use('/api/budget',     budgetRoutes);
app.use('/api/expenses',   expenseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/accounts',   accountRoutes);
app.use('/api/currencies', currencyRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Budget API is running', timestamp: new Date().toISOString() });
});

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

export default app;
