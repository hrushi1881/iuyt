import React from 'react';
import BalanceCard from '../components/dashboard/BalanceCard';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import FinancialHealthCard from '../components/dashboard/FinancialHealthCard';
import QuickActions from '../components/dashboard/QuickActions';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BalanceCard />
        <QuickActions />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <RecentTransactions />
        </div>
        <div>
          <FinancialHealthCard />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;