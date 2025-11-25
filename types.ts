export type TransactionType = 'income' | 'expense';

export type Currency = 'USD' | 'IQD';

export const CurrencyConfig: Record<Currency, { symbol: string, label: string }> = {
  'USD': { symbol: '$', label: 'USD ($)' },
  'IQD': { symbol: 'IQD ', label: 'Iraqi Dinar (IQD)' }
};

export enum ExpenseCategory {
  FOOD = 'Food',
  TRANSPORT = 'Transport',
  UTILITIES = 'Utilities',
  ENTERTAINMENT = 'Entertainment',
  SHOPPING = 'Shopping',
  HEALTH = 'Health',
  HOUSING = 'Housing',
  OTHER = 'Other'
}

export enum IncomeCategory {
  SALARY = 'Salary',
  FREELANCE = 'Freelance',
  INVESTMENT = 'Investment',
  GIFT = 'Gift',
  REFUND = 'Refund',
  OTHER = 'Other'
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // ISO string YYYY-MM-DD
  description: string;
  merchant?: string; // Merchant for expense, Payer for income
}

export type ViewState = 'dashboard' | 'add' | 'list' | 'insights';