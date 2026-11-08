import 'dotenv/config';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import { seedCurrencies } from './src/controllers/currencyController.js';

const PORT = process.env.PORT || 5000;

connectDB().then(() => seedCurrencies());

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  });
}

export default app;
