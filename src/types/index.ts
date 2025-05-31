export type TransactionType = 'income' | 'expense';

export type IncomeCategory = 'regular' | 'variable' | 'one-time' | 'passive';
export type ExpenseCategory = 
  | 'housing' 
  | 'transportation' 
  | 'food' 
  | 'utilities' 
  | 'healthcare' 
  | 'personal' 
  | 'entertainment' 
  | 'education' 
  | 'debt' 
  | 'savings' 
  | 'other';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  category: IncomeCategory | ExpenseCategory;
  accountId: string;
  paymentMethod?: string;
  location?: string;
  notes?: string;
}

export interface Account {
  id: string;
  name: string;
  balance: number;
  type: 'personal' | 'business' | 'savings' | 'project';
  color: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  expenseToIncomeRatio: number;
}

export interface RecurringIncome {
  id: string;
  description: string;
  amount: number;
  dayOfMonth: number;
  category: IncomeCategory;
  lastProcessed?: string;
  notes?: string;
}