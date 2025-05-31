import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useTransactions } from '../../context/TransactionContext';

const BalanceCard: React.FC = () => {
  const { getCurrentBalance, state } = useTransactions();
  const currentBalance = getCurrentBalance();
  const { netCashFlow } = state.currentMonthSummary;
  
  const isPositiveCashFlow = netCashFlow >= 0;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white">
        <h2 className="text-lg font-medium opacity-90">Current Balance</h2>
        <div className="mt-2 flex items-end">
          <span className="text-3xl font-bold">₹{currentBalance.toLocaleString()}</span>
          <span className="ml-2 text-sm opacity-75">Available</span>
        </div>
        
        <div className={`mt-4 flex items-center ${isPositiveCashFlow ? 'text-green-200' : 'text-red-200'}`}>
          {isPositiveCashFlow ? (
            <TrendingUp size={16} className="mr-1" />
          ) : (
            <TrendingDown size={16} className="mr-1" />
          )}
          <span className="text-sm">
            {isPositiveCashFlow ? 'Positive' : 'Negative'} cash flow this month
          </span>
        </div>
      </div>
      
      <div className="p-4 bg-white">
        <div className="flex justify-between text-sm">
          <div>
            <p className="text-gray-500">Income</p>
            <p className="font-medium text-green-600">+₹{state.currentMonthSummary.totalIncome.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-500">Expenses</p>
            <p className="font-medium text-red-600">-₹{state.currentMonthSummary.totalExpenses.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-500">Net</p>
            <p className={`font-medium ${isPositiveCashFlow ? 'text-green-600' : 'text-red-600'}`}>
              {isPositiveCashFlow ? '+' : ''}₹{netCashFlow.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;