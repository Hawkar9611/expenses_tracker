import React from 'react';
import { LayoutDashboard, PlusCircle, List, Brain, Sun, Moon, Coins } from 'lucide-react';
import { ViewState, Currency, CurrencyConfig } from '../types';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  setView, 
  isMobileOpen, 
  setIsMobileOpen, 
  darkMode, 
  toggleDarkMode,
  currency,
  setCurrency
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'add', label: 'Add Transaction', icon: PlusCircle },
    { id: 'list', label: 'Transactions', icon: List },
    { id: 'insights', label: 'AI Insights', icon: Brain },
  ];

  const handleNavClick = (view: string) => {
    setView(view as ViewState);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 dark:bg-slate-950 dark:border-r dark:border-slate-800 text-white transform transition-transform duration-300 ease-in-out flex flex-col
        md:relative md:translate-x-0
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-emerald-400">Gemini</span>Fin
          </h1>
          <p className="text-slate-400 text-sm mt-1">Smart Finance Tracker</p>
        </div>

        <nav className="mt-6 px-4 space-y-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                  ${isActive 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                `}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-3">
          
          {/* Currency Selector */}
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-xl">
            <Coins size={16} className="text-slate-400" />
            <select 
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="bg-transparent text-sm text-slate-300 focus:outline-none w-full cursor-pointer"
            >
              {Object.entries(CurrencyConfig).map(([code, config]) => (
                <option key={code} value={code} className="bg-slate-800">
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span className="font-medium">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <div className="bg-slate-800 dark:bg-slate-900 rounded-lg p-4 text-xs text-slate-400 mt-2">
            <p>Powered by Google Gemini</p>
            <p className="mt-1 opacity-75">v1.3.0</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;