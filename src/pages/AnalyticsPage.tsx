import React, { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { BarChart, PieChart, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const AnalyticsPage: React.FC = () => {
  const { state } = useTransactions();
  const { transactions } = state;
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewType, setViewType] = useState<'expenses' | 'income'>('expenses');
  
  // Format month and year
  const monthYearDisplay = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  
  // Get first and last day of the month
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString();
  const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toISOString();
  
  // Filter transactions for the current month
  const currentMonthTransactions = transactions.filter(
    (t) => t.date >= firstDay && t.date <= lastDay
  );
  
  // Filter by type (expense or income)
  const filteredTransactions = currentMonthTransactions.filter(
    (t) => t.type === viewType
  );
  
  // Group by category
  const categoryTotals = filteredTransactions.reduce((acc, transaction) => {
    if (!acc[transaction.category]) {
      acc[transaction.category] = 0;
    }
    acc[transaction.category] += transaction.amount;
    return acc;
  }, {} as Record<string, number>);
  
  // Calculate percentages
  const totalAmount = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
  
  // Sort categories by amount (highest first)
  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5); // Top 5 categories
  
  // Previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  // Next month
  const goToNextMonth = () => {
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    const now = new Date();
    if (nextMonth <= now) {
      setCurrentMonth(nextMonth);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <button 
              className={`px-4 py-2 rounded-md focus:outline-none ${
                viewType === 'expenses' 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setViewType('expenses')}
            >
              Expenses
            </button>
            <button 
              className={`px-4 py-2 rounded-md focus:outline-none ${
                viewType === 'income' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setViewType('income')}
            >
              Income
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={goToPreviousMonth}
              className="p-1 text-gray-500 hover:text-gray-700"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center">
              <Calendar size={16} className="mr-2 text-gray-500" />
              <span className="text-sm font-medium">{monthYearDisplay}</span>
            </div>
            <button 
              onClick={goToNextMonth}
              className="p-1 text-gray-500 hover:text-gray-700"
              disabled={
                new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1) > new Date()
              }
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">
            {viewType === 'expenses' ? 'Top Expense Categories' : 'Top Income Sources'}
          </h2>
          
          {totalAmount > 0 ? (
            <div className="space-y-4">
              {sortedCategories.map(([category, amount]) => {
                const percentage = Math.round((amount / totalAmount) * 100);
                
                return (
                  <div key={category}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {category}
                      </span>
                      <span className="text-sm text-gray-600">
                        ₹{amount.toLocaleString()} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`rounded-full h-2 ${
                          viewType === 'expenses' ? 'bg-red-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              
              <div className="mt-8 flex justify-center">
                <div className="inline-flex items-center px-4 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                  <span className="mr-2">
                    {viewType === 'expenses' ? <BarChart size={16} /> : <PieChart size={16} />}
                  </span>
                  Total {viewType}: ₹{totalAmount.toLocaleString()}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-gray-500">
              <p>No {viewType} data for this month</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-800">Monthly Trends</h2>
          </div>
          <div className="p-6 flex justify-center items-center h-48">
            <p className="text-gray-500">Monthly trend visualization coming soon</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-800">
              {viewType === 'expenses' ? 'Spending' : 'Income'} Breakdown
            </h2>
          </div>
          <div className="p-6 flex justify-center items-center h-48">
            <p className="text-gray-500">Pie chart visualization coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;