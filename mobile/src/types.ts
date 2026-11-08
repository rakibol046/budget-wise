export type User = {
  id: string;
  name: string;
  email: string;
  currency: string;
};
export type Category = {
  _id: string;
  slug: string;
  name: string;
  icon: string;
  color: string;
  isActive: boolean;
  isDefault: boolean;
};
export type Account = {
  _id: string;
  name: string;
  bankName: string;
  accountType: string;
  balance: number;
  color: string;
  icon: string;
  isDefault: boolean;
};
export type Expense = {
  _id: string;
  amount: number;
  category: string;
  date: string;
  note: string;
  isRecurring: boolean;
  accountId: string | null;
};
export type Budget = {
  categories: Record<string, number>;
  month: string;
  total: number;
};
export type Insights = {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  percentage: number;
  dailyAvg: number;
  predicted: number;
  topCategory: string | null;
  warning: string;
  byCat: Record<string, number>;
  daysPassed: number;
  totalDays: number;
};
export type FinanceData = {
  expenses: Expense[];
  categories: Category[];
  accounts: Account[];
  budget: Budget | null;
  insights: Insights | null;
};
export type Tab =
  "Home" | "Expenses" | "Budget" | "Accounts" | "Settings" | "Categories";
