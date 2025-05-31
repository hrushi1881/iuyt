import React, { useState } from 'react';
import { Plus, Menu, Bell, User } from 'lucide-react';
import { useTransactions } from '../../context/TransactionContext';

const TopBar: React.FC = () => {
  const { getActiveAccount } = useTransactions();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  
  const activeAccount = getActiveAccount();

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center">
          <button 
            className="md:hidden text-gray-500 mr-4"
            onClick={() => setShowMobileNav(!showMobileNav)}
          >
            <Menu size={24} />
          </button>
          <div className="md:hidden flex items-center">
            <h1 className="text-xl font-bold text-blue-600">CalcWise</h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="hidden md:block">
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition">
              <Plus size={18} className="mr-1" />
              <span>New Transaction</span>
            </button>
          </div>
          <button className="md:hidden p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
            <Plus size={18} />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
            <Bell size={20} />
          </button>
          <div className="relative">
            <button 
              className="flex items-center space-x-2"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-700">
                <User size={16} />
              </div>
              <div className="hidden md:block text-sm text-left">
                <p className="font-medium text-gray-700">{activeAccount?.name || "Account"}</p>
                <p className="text-xs text-gray-500">₹{activeAccount?.balance.toLocaleString() || "0"}</p>
              </div>
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50">
                <a href="#profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Your Profile</a>
                <a href="#settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                <a href="#signout" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign out</a>
              </div>
            )}
          </div>
        </div>
      </div>

      {showMobileNav && (
        <nav className="md:hidden bg-gray-50 p-4 border-t border-gray-100">
          <ul className="space-y-2">
            <li>
              <a href="/" className="block py-2 px-4 text-gray-800 hover:bg-gray-100 rounded-md">Dashboard</a>
            </li>
            <li>
              <a href="/transactions" className="block py-2 px-4 text-gray-800 hover:bg-gray-100 rounded-md">Transactions</a>
            </li>
            <li>
              <a href="/analytics" className="block py-2 px-4 text-gray-800 hover:bg-gray-100 rounded-md">Analytics</a>
            </li>
            <li>
              <a href="/budgets" className="block py-2 px-4 text-gray-800 hover:bg-gray-100 rounded-md">Budgets</a>
            </li>
            <li>
              <a href="/settings" className="block py-2 px-4 text-gray-800 hover:bg-gray-100 rounded-md">Settings</a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
};

export default TopBar;