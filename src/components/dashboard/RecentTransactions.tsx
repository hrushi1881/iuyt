import React from 'react';
import { useTransactions } from '../../context/TransactionContext';
import TransactionItem from '../transactions/TransactionItem';

const RecentTransactions: React.FC = () => {
  const { state } = useTransactions();
  const { transactions } = state;
  
  // Get the 5 most recent transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-medium text-gray-800">Recent Transactions</h2>
      </div>
      
      <div className="divide-y divide-gray-100">
        {recentTransactions.length > 0 ? (
          recentTransactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))
        ) : (
          <div className="p-6 text-center text-gray-500">
            <p>No transactions yet</p>
            <p className="text-sm mt-1">Add your first transaction to get started</p>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <a 
          href="/transactions" 
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View all transactions
        </a>
      </div>
    </div>
  );
};

export default RecentTransactions;