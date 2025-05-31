import React, { useState } from 'react';
import { PlusCircle, MinusCircle, Clock, ChevronRight } from 'lucide-react';
import { useTransactions } from '../../context/TransactionContext';
import AddTransactionModal from '../transactions/AddTransactionModal';

const QuickActions: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');

  const handleAddIncome = () => {
    setTransactionType('income');
    setIsModalOpen(true);
  };

  const handleAddExpense = () => {
    setTransactionType('expense');
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-medium text-gray-800">Quick Actions</h2>
      </div>
      
      <div className="p-4 grid grid-cols-2 gap-4">
        <button 
          onClick={handleAddIncome}
          className="flex items-center p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
        >
          <PlusCircle size={20} className="mr-3" />
          <div className="text-left">
            <p className="font-medium">Add Income</p>
            <p className="text-xs text-green-600">Record money coming in</p>
          </div>
        </button>
        
        <button 
          onClick={handleAddExpense}
          className="flex items-center p-4 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
        >
          <MinusCircle size={20} className="mr-3" />
          <div className="text-left">
            <p className="font-medium">Add Expense</p>
            <p className="text-xs text-red-600">Record money going out</p>
          </div>
        </button>
      </div>
      
      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <a 
          href="/scheduled" 
          className="flex items-center justify-between text-gray-600 hover:text-gray-800"
        >
          <div className="flex items-center">
            <Clock size={16} className="mr-2" />
            <span className="text-sm">Scheduled Transactions</span>
          </div>
          <ChevronRight size={16} />
        </a>
      </div>

      {isModalOpen && (
        <AddTransactionModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialType={transactionType}
        />
      )}
    </div>
  );
};

export default QuickActions;