import React from 'react';
import { useTransactions } from '../../context/TransactionContext';
import { NavLink } from '../ui/NavLink';
import { 
  LayoutDashboard, 
  CreditCard, 
  BarChart2, 
  PieChart, 
  Settings, 
  PlusCircle, 
  Wallet
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { state, dispatch } = useTransactions();

  const handleAccountChange = (accountId: string) => {
    dispatch({ type: 'SET_ACTIVE_ACCOUNT', payload: accountId });
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white shadow-lg">
      <div className="p-4 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-blue-600 flex items-center">
          <Wallet className="mr-2" /> CalcWise
        </h1>
        <p className="text-gray-500 text-xs mt-1">Bank-Like Expense Tracker</p>
      </div>

      <div className="p-4">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Navigation
        </h2>
        <nav className="space-y-1">
          <NavLink to="/" icon={<LayoutDashboard size={18} />} label="Dashboard" />
          <NavLink to="/transactions" icon={<CreditCard size={18} />} label="Transactions" />
          <NavLink to="/analytics" icon={<BarChart2 size={18} />} label="Analytics" />
          <NavLink to="/budgets" icon={<PieChart size={18} />} label="Budgets" />
          <NavLink to="/settings" icon={<Settings size={18} />} label="Settings" />
        </nav>
      </div>

      <div className="p-4 mt-auto border-t border-gray-100">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex justify-between items-center">
          Accounts
          <button className="text-blue-500 hover:text-blue-700">
            <PlusCircle size={16} />
          </button>
        </h2>
        <div className="space-y-2">
          {state.accounts.map((account) => (
            <button
              key={account.id}
              onClick={() => handleAccountChange(account.id)}
              className={`w-full px-3 py-2 text-left text-sm rounded-lg flex items-center ${
                account.id === state.activeAccountId
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: account.color }}
              ></span>
              <div>
                <div className="font-medium">{account.name}</div>
                <div className="text-xs">₹{account.balance.toLocaleString()}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;