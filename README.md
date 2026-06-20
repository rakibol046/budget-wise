# BudgetWise — Personal Finance Dashboard

> A full-stack personal finance dashboard to track expenses, set monthly budgets, manage bank accounts, and visualize spending habits with real-time charts.

---

## Motivation

Managing personal finances is one of those tasks everyone knows they should do, but rarely has a good tool for. Generic spreadsheets are tedious; most budget apps are either too bloated or locked behind subscriptions.

BudgetWise was built to be a clean, fast, and completely self-hostable alternative — with features that actually matter:

- Know exactly where your money goes each month
- Set budgets per category and get insights when you overspend
- Track balances across multiple bank accounts
- Handle recurring expenses automatically so nothing gets missed
- Work in your own currency from day one

The project also served as a practical sandbox for building a modern full-stack app with the **latest versions** of the React and Node ecosystems — React 19, Express 5, Tailwind CSS v4, and Zustand v5 — all at once.

---

## Features

- **Dashboard** — monthly income vs. expense overview, top spending categories, recent transactions
- **Expense Tracking** — add, edit, delete expenses with category tagging and notes; CSV export
- **Monthly Budgets** — set per-category limits, track utilization, view month-over-month insights
- **Bank Accounts** — manage multiple accounts and track individual balances
- **Custom Categories** — create and color-code your own spending categories
- **Recurring Expenses** — mark expenses as recurring; missing entries are auto-generated on login
- **Multi-Currency Support** — choose your base currency at registration
- **Email Verification** — OTP-based email verification on sign-up via Nodemailer
- **Dark / Light Mode** — persisted theme preference
- **Interactive Charts** — bar, pie, and line charts via Recharts
- **Rate Limiting & Helmet** — production-ready security headers and API rate limits

---

## Tech Stack

### Backend
| Layer | Library |
|---|---|
| Runtime | Node.js ≥ 18 (ESM) |
| Framework | Express 5 |
| Database | MongoDB Atlas + Mongoose 8 |
| Auth | JWT + bcryptjs |
| Email | Nodemailer (SMTP / Gmail) |
| Scheduler | node-cron |
| Validation | express-validator |
| Security | Helmet, express-rate-limit |
| Date handling | date-fns 4 |

### Frontend
| Layer | Library |
|---|---|
| UI Framework | React 19 |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS v4 (CSS-first, no config file) |
| Routing | React Router v7 |
| State Management | Zustand v5 |
| HTTP Client | Axios |
| Charts | Recharts |
| CSV Parsing | PapaParse |
| Toasts | react-hot-toast |

---

## Project Structure

```
budget-management-system/
├── backend/
│   ├── server.js                  # Express app entry point
│   ├── scripts/seed.js            # Demo data seeder
│   └── src/
│       ├── config/db.js
│       ├── controllers/           # authController, budgetController, expenseController …
│       ├── middleware/            # auth, error, validation
│       ├── models/                # User, Expense, Budget, Category, BankAccount, Currency
│       ├── routes/                # auth, expenses, budget, categories, accounts, currencies
│       ├── services/insightService.js
│       └── utils/                 # helpers, mailer, recurring
└── frontend/
    └── src/
        ├── App.jsx
        ├── components/            # Navbar, Charts, ExpenseForm, ExpenseList …
        ├── pages/                 # Dashboard, Expenses, Budget, Accounts, Categories, Settings …
        ├── services/              # api.js (Axios instance), auth, budget, expense …
        ├── store/                 # authStore, expenseStore, budgetStore … (Zustand)
        └── utils/                 # formatters, calculations
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster (free tier works fine)
- A Gmail account with an [App Password](https://myaccount.google.com/apppasswords) for email verification

### 1. Clone the repo

```bash
git clone https://github.com/your-username/budget-management-system.git
cd budget-management-system
```

### 2. Configure the backend

```bash
cd backend
```

Create a `.env` file with the following:

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/budget-management-db
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Email (needed for OTP verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=BudgetWise <you@gmail.com>
```

Install dependencies and start:

```bash
npm install
npm run dev
```

The API will be available at `http://localhost:5000`.

### 3. Configure the frontend

```bash
cd ../frontend
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

Install dependencies and start:

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

### 4. (Optional) Seed demo data

```bash
cd backend
npm run seed
```

This creates a demo account pre-loaded with sample data:

| Field | Value |
|---|---|
| Email | `rakib.fullstack.dev@gmail.com` |
| Password | `123456` |

---

## Environment Variables Reference

### Backend

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret key for signing JWTs |
| `JWT_EXPIRES_IN` | No | Token expiry (default: `7d`) |
| `PORT` | No | API port (default: `5000`) |
| `NODE_ENV` | No | `development` or `production` |
| `CLIENT_URL` | Yes | Frontend origin for CORS |
| `SMTP_HOST` | No | SMTP server host |
| `SMTP_PORT` | No | SMTP server port |
| `SMTP_USER` | No | SMTP username |
| `SMTP_PASS` | No | SMTP password / App Password |
| `SMTP_FROM` | No | Sender name and address |

### Frontend

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | Backend API base URL |

---

## Scripts

| Command | Description |
|---|---|
| `backend: npm run dev` | Start backend with nodemon (hot reload) |
| `backend: npm start` | Start backend in production mode |
| `backend: npm run seed` | Seed demo user + sample data |
| `frontend: npm run dev` | Start Vite dev server |
| `frontend: npm run build` | Build for production |
| `frontend: npm run preview` | Preview production build locally |

---

## License

MIT
