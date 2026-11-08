import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import budgetRoutes from './routes/budget.js';
import expenseRoutes from './routes/expenses.js';
import categoryRoutes from './routes/categories.js';
import accountRoutes from './routes/accounts.js';
import currencyRoutes from './routes/currencies.js';
import { errorHandler } from './middleware/error.js';

const app = express();
const api = express.Router();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

const limiter = rateLimit({
  windowMs: 3 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
api.use(limiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

api.use('/auth',       authRoutes);
api.use('/budget',     budgetRoutes);
api.use('/expenses',   expenseRoutes);
api.use('/categories', categoryRoutes);
api.use('/accounts',   accountRoutes);
api.use('/currencies', currencyRoutes);

api.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Budget API is running', timestamp: new Date().toISOString() });
});

// Services preserve the public request path, including the mobile API prefix.
app.use(['/api', '/_/backend/api'], api);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

export default app;
