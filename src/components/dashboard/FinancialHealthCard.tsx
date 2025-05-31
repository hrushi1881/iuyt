import React from 'react';
import { useTransactions } from '../../context/TransactionContext';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

const FinancialHealthCard: React.FC = () => {
  const { state } = useTransactions();
  const { expenseToIncomeRatio, netCashFlow } = state.currentMonthSummary;
  
  // Calculate health score (simplified version)
  const getHealthStatus = () => {
    if (expenseToIncomeRatio > 0.9 || netCashFlow < 0) {
      return {
        status: 'Needs Attention',
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        icon: <AlertCircle className="text-red-500" size={18} />,
      };
    } else if (expenseToIncomeRatio > 0.7) {
      return {
        status: 'Fair',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50',
        icon: <AlertTriangle className="text-yellow-500" size={18} />,
      };
    } else {
      return {
        status: 'Good',
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        icon: <CheckCircle className="text-green-500" size={18} />,
      };
    }
  };

  const healthStatus = getHealthStatus();
  const expenseRatioPercentage = Math.round(expenseToIncomeRatio * 100);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-medium text-gray-800">Financial Health</h2>
      </div>
      
      <div className="p-6">
        <div className={`p-3 rounded-lg ${healthStatus.bgColor} flex items-center mb-4`}>
          {healthStatus.icon}
          <span className={`ml-2 font-medium ${healthStatus.color}`}>
            {healthStatus.status}
          </span>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-600">Expense to Income Ratio</span>
              <span className="text-sm font-medium text-gray-800">{expenseRatioPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`rounded-full h-2 ${
                  expenseRatioPercentage > 90 
                    ? 'bg-red-500' 
                    : expenseRatioPercentage > 70 
                    ? 'bg-yellow-500' 
                    : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(expenseRatioPercentage, 100)}%` }}
              ></div>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {expenseRatioPercentage > 90 
                ? 'You\'re spending almost all your income' 
                : expenseRatioPercentage > 70 
                ? 'Try to reduce expenses to improve savings' 
                : 'Great job keeping expenses under control!'}
            </p>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-600">Cash Flow</span>
              <span className={`text-sm font-medium ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {netCashFlow >= 0 ? '+' : ''}₹{netCashFlow.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {netCashFlow >= 0 
                ? 'Positive cash flow indicates good financial health' 
                : 'Negative cash flow means you\'re spending more than you earn'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialHealthCard;