import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './components/Layout/AppLayout';
import Dashboard from './pages/Dashboard';
import TransactionsPage from './pages/TransactionsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';
import WelcomePage from './pages/WelcomePage';
import { TransactionProvider } from './context/TransactionContext';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <AuthProvider>
      <TransactionProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/welcome" element={<WelcomePage />} />
            <Route
              path="/"
              element={
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              }
            />
            <Route
              path="/transactions"
              element={
                <AppLayout>
                  <TransactionsPage />
                </AppLayout>
              }
            />
            <Route
              path="/analytics"
              element={
                <AppLayout>
                  <AnalyticsPage />
                </AppLayout>
              }
            />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </Router>
      </TransactionProvider>
    </AuthProvider>
  );
}

export default App;