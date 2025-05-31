import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Transaction, Account, FinancialSummary, RecurringIncome } from '../types';
import { startOfMonth, endOfMonth, isWithinInterval, addMonths } from 'date-fns';

interface TransactionState {
  transactions: Transaction[];
  accounts: Account[];
  activeAccountId: string;
  isLoading: boolean;
  currentMonthSummary: FinancialSummary;
  recurringIncome: RecurringIncome[];
}

type TransactionAction =
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'ADD_ACCOUNT'; payload: Account }
  | { type: 'UPDATE_ACCOUNT'; payload: Account }
  | { type: 'SET_ACCOUNTS'; payload: Account[] }
  | { type: 'SET_ACTIVE_ACCOUNT'; payload: string }
  | { type: 'UPDATE_SUMMARY'; payload: FinancialSummary }
  | { type: 'ADD_RECURRING_INCOME'; payload: RecurringIncome }
  | { type: 'UPDATE_RECURRING_INCOME'; payload: RecurringIncome }
  | { type: 'DELETE_RECURRING_INCOME'; payload: string };

const defaultState: TransactionState = {
  transactions: [],
  accounts: [],
  activeAccountId: '',
  isLoading: true,
  currentMonthSummary: {
    totalIncome: 0,
    totalExpenses: 0,
    netCashFlow: 0,
    expenseToIncomeRatio: 0,
  },
  recurringIncome: [],
};

const TransactionContext = createContext<{
  state: TransactionState;
  dispatch: React.Dispatch<TransactionAction>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  addAccount: (account: Omit<Account, 'id'>) => void;
  getCurrentBalance: () => number;
  getActiveAccount: () => Account | undefined;
  calculateMonthlySummary: () => void;
  addRecurringIncome: (income: Omit<RecurringIncome, 'id'>) => void;
  updateRecurringIncome: (income: RecurringIncome) => void;
  deleteRecurringIncome: (id: string) => void;
}>({
  state: defaultState,
  dispatch: () => null,
  addTransaction: () => null,
  deleteTransaction: () => null,
  addAccount: () => null,
  getCurrentBalance: () => 0,
  getActiveAccount: () => undefined,
  calculateMonthlySummary: () => null,
  addRecurringIncome: () => null,
  updateRecurringIncome: () => null,
  deleteRecurringIncome: () => null,
});

function transactionReducer(state: TransactionState, action: TransactionAction): TransactionState {
  switch (action.type) {
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      };
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
      };
    case 'SET_TRANSACTIONS':
      return {
        ...state,
        transactions: action.payload,
        isLoading: false,
      };
    case 'ADD_ACCOUNT':
      return {
        ...state,
        accounts: [...state.accounts, action.payload],
        activeAccountId: state.activeAccountId || action.payload.id,
      };
    case 'UPDATE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.map((a) =>
          a.id === action.payload.id ? action.payload : a
        ),
      };
    case 'SET_ACCOUNTS':
      return {
        ...state,
        accounts: action.payload,
        activeAccountId: action.payload.length > 0 ? action.payload[0].id : '',
        isLoading: false,
      };
    case 'SET_ACTIVE_ACCOUNT':
      return {
        ...state,
        activeAccountId: action.payload,
      };
    case 'UPDATE_SUMMARY':
      return {
        ...state,
        currentMonthSummary: action.payload,
      };
    case 'ADD_RECURRING_INCOME':
      return {
        ...state,
        recurringIncome: [...state.recurringIncome, action.payload],
      };
    case 'UPDATE_RECURRING_INCOME':
      return {
        ...state,
        recurringIncome: state.recurringIncome.map((income) =>
          income.id === action.payload.id ? action.payload : income
        ),
      };
    case 'DELETE_RECURRING_INCOME':
      return {
        ...state,
        recurringIncome: state.recurringIncome.filter((income) => income.id !== action.payload),
      };
    default:
      return state;
  }
}

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(transactionReducer, defaultState);

  // Initialize with sample data if none exists
  useEffect(() => {
    const storedTransactions = localStorage.getItem('transactions');
    const storedAccounts = localStorage.getItem('accounts');
    const storedRecurringIncome = localStorage.getItem('recurringIncome');

    if (storedAccounts) {
      dispatch({ type: 'SET_ACCOUNTS', payload: JSON.parse(storedAccounts) });
    } else {
      // Create a default account
      const defaultAccount: Account = {
        id: generateId(),
        name: 'Main Account',
        balance: 75000,
        type: 'personal',
        color: '#3B82F6',
      };
      dispatch({ type: 'SET_ACCOUNTS', payload: [defaultAccount] });
      localStorage.setItem('accounts', JSON.stringify([defaultAccount]));
    }

    if (storedTransactions) {
      dispatch({ type: 'SET_TRANSACTIONS', payload: JSON.parse(storedTransactions) });
    } else {
      dispatch({ type: 'SET_TRANSACTIONS', payload: [] });
    }

    if (storedRecurringIncome) {
      const recurringIncome = JSON.parse(storedRecurringIncome);
      dispatch({ type: 'SET_RECURRING_INCOME', payload: recurringIncome });
    }
  }, []);

  // Update local storage when data changes
  useEffect(() => {
    if (!state.isLoading) {
      localStorage.setItem('transactions', JSON.stringify(state.transactions));
      localStorage.setItem('accounts', JSON.stringify(state.accounts));
      localStorage.setItem('recurringIncome', JSON.stringify(state.recurringIncome));
      calculateMonthlySummary();
    }
  }, [state.transactions, state.accounts, state.recurringIncome, state.isLoading]);

  // Process recurring income
  useEffect(() => {
    const now = new Date();
    const currentMonth = startOfMonth(now);
    const nextMonth = endOfMonth(addMonths(currentMonth, 1));

    state.recurringIncome.forEach((income) => {
      const lastProcessedDate = new Date(income.lastProcessed || '2000-01-01');
      
      if (lastProcessedDate < currentMonth) {
        // Process missed months
        let processMonth = new Date(lastProcessedDate);
        while (processMonth < nextMonth) {
          const dueDate = new Date(processMonth.getFullYear(), processMonth.getMonth(), income.dayOfMonth);
          
          if (dueDate <= now) {
            addTransaction({
              type: 'income',
              amount: income.amount,
              description: income.description,
              category: 'regular',
              date: dueDate.toISOString(),
              accountId: state.activeAccountId,
              notes: `Recurring income: ${income.description}`,
            });
          }
          
          processMonth = addMonths(processMonth, 1);
        }
        
        // Update last processed date
        updateRecurringIncome({
          ...income,
          lastProcessed: now.toISOString(),
        });
      }
    });
  }, [state.recurringIncome]);

  const generateId = () => {
    return Math.random().toString(36).substring(2, 15);
  };

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: generateId(),
      accountId: state.activeAccountId,
      date: transaction.date || new Date().toISOString(),
    };

    // Update account balance
    const account = state.accounts.find((a) => a.id === state.activeAccountId);
    if (account) {
      const newBalance =
        transaction.type === 'income'
          ? account.balance + transaction.amount
          : account.balance - transaction.amount;

      const updatedAccount: Account = { ...account, balance: newBalance };
      dispatch({ type: 'UPDATE_ACCOUNT', payload: updatedAccount });
    }

    dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction });
  };

  const deleteTransaction = (id: string) => {
    const transaction = state.transactions.find((t) => t.id === id);
    if (!transaction) return;

    // Revert account balance
    const account = state.accounts.find((a) => a.id === transaction.accountId);
    if (account) {
      const newBalance =
        transaction.type === 'income'
          ? account.balance - transaction.amount
          : account.balance + transaction.amount;

      const updatedAccount: Account = { ...account, balance: newBalance };
      dispatch({ type: 'UPDATE_ACCOUNT', payload: updatedAccount });
    }

    dispatch({ type: 'DELETE_TRANSACTION', payload: id });
  };

  const addAccount = (account: Omit<Account, 'id'>) => {
    const newAccount: Account = {
      ...account,
      id: generateId(),
    };
    dispatch({ type: 'ADD_ACCOUNT', payload: newAccount });
  };

  const getCurrentBalance = () => {
    const activeAccount = state.accounts.find((a) => a.id === state.activeAccountId);
    return activeAccount?.balance || 0;
  };

  const getActiveAccount = () => {
    return state.accounts.find((a) => a.id === state.activeAccountId);
  };

  const calculateMonthlySummary = () => {
    const now = new Date();
    const monthInterval = {
      start: startOfMonth(now),
      end: endOfMonth(now),
    };

    const currentMonthTransactions = state.transactions.filter((t) =>
      isWithinInterval(new Date(t.date), monthInterval)
    );

    const totalIncome = currentMonthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = currentMonthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netCashFlow = totalIncome - totalExpenses;
    const expenseToIncomeRatio = totalIncome > 0 ? totalExpenses / totalIncome : 0;

    dispatch({
      type: 'UPDATE_SUMMARY',
      payload: {
        totalIncome,
        totalExpenses,
        netCashFlow,
        expenseToIncomeRatio,
      },
    });
  };

  const addRecurringIncome = (income: Omit<RecurringIncome, 'id'>) => {
    const newIncome: RecurringIncome = {
      ...income,
      id: generateId(),
    };
    dispatch({ type: 'ADD_RECURRING_INCOME', payload: newIncome });
  };

  const updateRecurringIncome = (income: RecurringIncome) => {
    dispatch({ type: 'UPDATE_RECURRING_INCOME', payload: income });
  };

  const deleteRecurringIncome = (id: string) => {
    dispatch({ type: 'DELETE_RECURRING_INCOME', payload: id });
  };

  return (
    <TransactionContext.Provider
      value={{
        state,
        dispatch,
        addTransaction,
        deleteTransaction,
        addAccount,
        getCurrentBalance,
        getActiveAccount,
        calculateMonthlySummary,
        addRecurringIncome,
        updateRecurringIncome,
        deleteRecurringIncome,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => useContext(TransactionContext);