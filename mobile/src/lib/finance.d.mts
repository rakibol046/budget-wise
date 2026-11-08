import type { Account, Category, Expense } from "../types";
export function currentMonth(date?: Date): string;
export function dateInput(date?: Date): string;
export function shiftMonth(month: string, offset: number): string;
export function monthLabel(month: string): string;
export function money(amount: number, currency?: string): string;
export function parseAmount(
  value: string,
  options?: { allowZero?: boolean; allowNegative?: boolean },
): number;
export function categoryFor(
  categories: Category[],
  slug: string,
): Pick<Category, "slug" | "name" | "icon" | "color">;
export function weeklySpending(expenses: Expense[]): number[];
export function expensesCsv(
  expenses: Expense[],
  categories: Category[],
  accounts: Account[],
): string;
