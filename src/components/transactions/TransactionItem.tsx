import React from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Home, 
  Car, 
  ShoppingCart, 
  Zap, 
  Heart, 
  Coffee, 
  GraduationCap,
  Receipt, 
  Coins, 
  FileText
} from 'lucide-react';
import { Transaction } from '../../types';

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const { type, amount, description, date, category } = transaction;
  
  const getCategoryIcon = () => {
    switch (category) {
      case 'housing':
        return <Home size={16} />;
      case 'transportation':
        return <Car size={16} />;
      case 'food':
        return <ShoppingCart size={16} />;
      case 'utilities':
        return <Zap size={16} />;
      case 'healthcare':
        return <Heart size={16} />;
      case 'entertainment':
        return <Coffee size={16} />;
      case 'education':
        return <GraduationCap size={16} />;
      case 'debt':
        return <Receipt size={16} />;
      case 'savings':
        return <Coins size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  const formattedDate = new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
      <div className="flex items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
          type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
        }`}>
          {type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
        </div>
        
        <div>
          <p className="font-medium text-gray-800">{description}</p>
          <div className="flex items-center text-xs text-gray-500">
            <span>{formattedDate}</span>
            <span className="mx-1">•</span>
            <div className="flex items-center">
              {getCategoryIcon()}
              <span className="ml-1 capitalize">{category}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className={`font-medium ${type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
        {type === 'income' ? '+' : '-'}₹{amount.toLocaleString()}
      </div>
    </div>
  );
};

export default TransactionItem;