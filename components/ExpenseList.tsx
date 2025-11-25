import React, { useState } from 'react';
import { Transaction, ExpenseCategory, IncomeCategory, Currency, CurrencyConfig } from '../types';
import { Search, Trash2, Filter, Download, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { generatePDF } from '../services/exportService';

interface ExpenseListProps {
  expenses: Transaction[]; 
  onDelete: (id: string) => void;
  currency: Currency;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses: transactions, onDelete, currency }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const currencySymbol = CurrencyConfig[currency].symbol;

  // Combine all categories for the dropdown
  const allCategories = [...Object.values(ExpenseCategory), ...Object.values(IncomeCategory)];
  // Unique set in case of overlaps (like 'Other')
  const uniqueCategories = Array.from(new Set(allCategories));

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = 
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.merchant?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesCategory = filterCategory === 'All' || t.category === filterCategory;

    return matchesSearch && matchesType && matchesCategory;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col h-[calc(100vh-140px)] animate-fade-in transition-colors">
      <div className="p-6 border-b border-gray-100 dark:border-slate-700 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white transition-colors">Transactions</h2>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="pl-10 pr-8 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none transition-colors"
            >
              <option value="All">All Categories</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => generatePDF(filteredTransactions, currency)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors font-medium whitespace-nowrap"
            title="Export filtered transactions to PDF"
          >
            <Download size={18} />
            <span className="hidden md:inline">Export PDF</span>
            <span className="md:hidden">Export</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-slate-900 sticky top-0 transition-colors z-10 shadow-sm">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Merchant / Source</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Amount</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
            {filteredTransactions.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 transition-colors">
                  {t.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                     {t.type === 'income' ? 
                        <ArrowUpCircle size={16} className="text-emerald-500" /> : 
                        <ArrowDownCircle size={16} className="text-red-500" />
                     }
                     <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white transition-colors">{t.merchant || t.description}</div>
                        {t.merchant && <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px] transition-colors">{t.description}</div>}
                     </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border transition-colors ${
                      t.type === 'income'
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800'
                      : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800'
                  }`}>
                    {t.category}
                  </span>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right transition-colors ${
                    t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'
                }`}>
                  {t.type === 'income' ? '+' : ''}{currencySymbol}{t.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => onDelete(t.id)}
                    className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Delete Transaction"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            
            {filteredTransactions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400 dark:text-gray-500 transition-colors">
                  No transactions found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseList;