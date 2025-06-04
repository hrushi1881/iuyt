import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Transaction, Account, FinancialSummary, RecurringIncome } from '../types';
import { startOfMonth, endOfMonth, isWithinInterval, addMonths } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

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
  | { type: 'DELETE_RECURRING_INCOME'; payload: string }
  | { type: 'SET_RECURRING_INCOME'; payload: RecurringIncome[] };

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
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addAccount: (account: Omit<Account, 'id'>) => Promise<void>;
  getCurrentBalance: () => number;
  getActiveAccount: () => Account | undefined;
  calculateMonthlySummary: () => void;
  addRecurringIncome: (income: Omit<RecurringIncome, 'id'>) => Promise<void>;
  updateRecurringIncome: (income: RecurringIncome) => Promise<void>;
  deleteRecurringIncome: (id: string) => Promise<void>;
}>({
  state: defaultState,
  dispatch: () => null,
  addTransaction: async () => {},
  deleteTransaction: async () => {},
  addAccount: async () => {},
  getCurrentBalance: () => 0,
  getActiveAccount: () => undefined,
  calculateMonthlySummary: () => null,
  addRecurringIncome: async () => {},
  updateRecurringIncome: async () => {},
  deleteRecurringIncome: async () => {},
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
    case 'SET_RECURRING_INCOME':
      return {
        ...state,
        recurringIncome: action.payload,
      };
    default:
      return state;
  }
}

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(transactionReducer, defaultState);
  const { user } = useAuth();

  // Load data from Supabase when component mounts
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        // Fetch accounts
        const { data: accounts, error: accountsError } = await supabase
          .from('accounts')
          .select('*')
          .eq('user_id', user.id);

        if (accountsError) throw accountsError;
        if (accounts) dispatch({ type: 'SET_ACCOUNTS', payload: accounts });

        // Fetch transactions
        const { data: transactions, error: transactionsError } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id);

        if (transactionsError) throw transactionsError;
        if (transactions) dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });

        // Fetch recurring income
        const { data: recurringIncome, error: recurringIncomeError } = await supabase
          .from('recurring_income')
          .select('*')
          .eq('user_id', user.id);

        if (recurringIncomeError) throw recurringIncomeError;
        if (recurringIncome) dispatch({ type: 'SET_RECURRING_INCOME', payload: recurringIncome });

      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [user]);

  // Process recurring income
  useEffect(() => {
    if (!user) return;

    const now = new Date();
    const currentMonth = startOfMonth(now);
    const nextMonth = endOfMonth(addMonths(currentMonth, 1));

    state.recurringIncome.forEach(async (income) => {
      const lastProcessedDate = new Date(income.lastProcessed || '2000-01-01');
      
      if (lastProcessedDate < currentMonth) {
        // Process missed months
        let processMonth = new Date(lastProcessedDate);
        while (processMonth < nextMonth) {
          const dueDate = new Date(processMonth.getFullYear(), processMonth.getMonth(), income.dayOfMonth);
          
          if (dueDate <= now) {
            await addTransaction({
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
        await updateRecurringIncome({
          ...income,
          lastProcessed: now.toISOString(),
        });
      }
    });
  }, [state.recurringIncome, user]);

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          ...transaction,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        dispatch({ type: 'ADD_TRANSACTION', payload: data });

        // Update account balance
        const account = state.accounts.find((a) => a.id === transaction.accountId);
        if (account) {
          const newBalance =
            transaction.type === 'income'
              ? account.balance + transaction.amount
              : account.balance - transaction.amount;

          await updateAccount({ ...account, balance: newBalance });
        }
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;

    try {
      const transaction = state.transactions.find((t) => t.id === id);
      if (!transaction) return;

      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      dispatch({ type: 'DELETE_TRANSACTION', payload: id });

      // Revert account balance
      const account = state.accounts.find((a) => a.id === transaction.accountId);
      if (account) {
        const newBalance =
          transaction.type === 'income'
            ? account.balance - transaction.amount
            : account.balance + transaction.amount;

        await updateAccount({ ...account, balance: newBalance });
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const addAccount = async (account: Omit<Account, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('accounts')
        .insert([{
          ...account,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        dispatch({ type: 'ADD_ACCOUNT', payload: data });
      }
    } catch (error) {
      console.error('Error adding account:', error);
    }
  };

  const updateAccount = async (account: Account) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('accounts')
        .update(account)
        .eq('id', account.id)
        .eq('user_id', user.id);

      if (error) throw error;
      dispatch({ type: 'UPDATE_ACCOUNT', payload: account });
    } catch (error) {
      console.error('Error updating account:', error);
    }
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

  const addRecurringIncome = async (income: Omit<RecurringIncome, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('recurring_income')
        .insert([{
          ...income,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        dispatch({ type: 'ADD_RECURRING_INCOME', payload: data });
      }
    } catch (error) {
      console.error('Error adding recurring income:', error);
    }
  };

  const updateRecurringIncome = async (income: RecurringIncome) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('recurring_income')
        .update(income)
        .eq('id', income.id)
        .eq('user_id', user.id);

      if (error) throw error;
      dispatch({ type: 'UPDATE_RECURRING_INCOME', payload: income });
    } catch (error) {
      console.error('Error updating recurring income:', error);
    }
  };

  const deleteRecurringIncome = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('recurring_income')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      dispatch({ type: 'DELETE_RECURRING_INCOME', payload: id });
    } catch (error) {
      console.error('Error deleting recurring income:', error);
    }
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