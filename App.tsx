import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AddTransactionForm from './components/AddExpenseForm';
import ExpenseList from './components/ExpenseList';
import AIInsights from './components/AIInsights';
import { Transaction, ViewState, Currency } from './types';
import { getTransactions, saveTransactions } from './services/storageService';
import { Menu } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Currency state with local storage persistence
  const [currency, setCurrency] = useState<Currency>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('currency');
        return (saved === 'USD' || saved === 'IQD') ? saved : 'USD';
      }
    } catch (e) { console.error(e); }
    return 'USD';
  });

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);
  
  // Dark mode state with local storage persistence
  const [darkMode, setDarkMode] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme === 'dark' || 
          (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
      }
    } catch (e) {
      console.error("Error accessing local storage", e);
    }
    return false;
  });

  // Apply dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Load data on mount
  useEffect(() => {
    const loaded = getTransactions();
    setTransactions(loaded);
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  const addTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
    setCurrentView('dashboard');
  };

  const deleteTransaction = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setTransactions(prev => prev.filter(e => e.id !== id));
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard expenses={transactions} darkMode={darkMode} currency={currency} />;
      case 'add':
        return <AddTransactionForm onAddTransaction={addTransaction} onCancel={() => setCurrentView('dashboard')} currency={currency} />;
      case 'list':
        return <ExpenseList expenses={transactions} onDelete={deleteTransaction} currency={currency} />;
      case 'insights':
        return <AIInsights expenses={transactions} currency={currency} />;
      default:
        return <Dashboard expenses={transactions} darkMode={darkMode} currency={currency} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950 overflow-hidden transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        currency={currency}
        setCurrency={setCurrency}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 p-4 md:hidden flex items-center justify-between z-10 transition-colors">
           <div className="font-bold text-xl text-slate-800 dark:text-white">
             <span className="text-emerald-500">Gemini</span>Fin
           </div>
           <button onClick={() => setIsMobileOpen(true)} className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors">
             <Menu size={24} />
           </button>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;