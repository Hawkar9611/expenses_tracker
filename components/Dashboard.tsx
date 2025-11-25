import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Transaction, Currency, CurrencyConfig } from '../types';
import { TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react';

interface DashboardProps {
  expenses: Transaction[]; 
  darkMode?: boolean;
  currency: Currency;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff6b6b'];

const Dashboard: React.FC<DashboardProps> = ({ expenses: transactions, darkMode = false, currency }) => {
  const currencySymbol = CurrencyConfig[currency].symbol;

  const stats = useMemo(() => {
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    return {
        income: totalIncome,
        expense: totalExpense,
        balance: totalIncome - totalExpense
    };
  }, [transactions]);

  const expenseCategoryData = useMemo(() => {
    const map = new Map<string, number>();
    transactions
        .filter(t => t.type === 'expense')
        .forEach(e => {
            map.set(e.category, (map.get(e.category) || 0) + e.amount);
        });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const monthlyData = useMemo(() => {
    const map = new Map<string, { income: number, expense: number }>();
    transactions.forEach(e => {
      const date = new Date(e.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!map.has(key)) map.set(key, { income: 0, expense: 0 });
      const current = map.get(key)!;
      if (e.type === 'income') current.income += e.amount;
      else current.expense += e.amount;
    });
    
    // Sort keys and take last 6 months
    const sortedKeys = Array.from(map.keys()).sort().slice(-6);
    return sortedKeys.map(key => ({
      name: key,
      income: map.get(key)!.income,
      expense: map.get(key)!.expense
    }));
  }, [transactions]);

  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const chartTextColor = darkMode ? '#94a3b8' : '#64748b';
  const tooltipStyle = darkMode ? { backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc' } : {};

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white transition-colors">Financial Overview</h2>
        <p className="text-gray-500 dark:text-gray-400 transition-colors">Track your income and spending</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Net Balance */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center justify-between transition-colors">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Net Balance</p>
            <p className={`text-3xl font-bold mt-1 ${stats.balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {currencySymbol}{stats.balance.toFixed(2)}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-full text-blue-600 dark:text-blue-400 transition-colors">
            <Wallet size={24} />
          </div>
        </div>
        
        {/* Income */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center justify-between transition-colors">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Income</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{currencySymbol}{stats.income.toFixed(2)}</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/30 p-3 rounded-full text-emerald-600 dark:text-emerald-400 transition-colors">
            <TrendingUp size={24} />
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center justify-between transition-colors">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Expenses</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{currencySymbol}{stats.expense.toFixed(2)}</p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/30 p-3 rounded-full text-orange-600 dark:text-orange-400 transition-colors">
            <TrendingDown size={24} />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 h-[400px] transition-colors">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 transition-colors">Income vs Expenses</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#e5e7eb'} />
              <XAxis dataKey="name" tick={{fontSize: 12, fill: chartTextColor}} axisLine={{stroke: chartTextColor}} tickLine={{stroke: chartTextColor}} />
              <YAxis tick={{fontSize: 12, fill: chartTextColor}} axisLine={{stroke: chartTextColor}} tickLine={{stroke: chartTextColor}} />
              <Tooltip 
                formatter={(value: number) => `${currencySymbol}${value.toFixed(2)}`} 
                cursor={{fill: darkMode ? '#334155' : '#f3f4f6', opacity: 0.4}}
                contentStyle={tooltipStyle}
              />
              <Legend />
              <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 h-[400px] transition-colors">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 transition-colors">Expense Breakdown</h3>
          {expenseCategoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                <Pie
                    data={expenseCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {expenseCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={darkMode ? '#1e293b' : '#fff'} />
                    ))}
                </Pie>
                <Tooltip 
                    formatter={(value: number) => `${currencySymbol}${value.toFixed(2)}`} 
                    contentStyle={tooltipStyle}
                    itemStyle={{ color: darkMode ? '#e2e8f0' : '#1e293b' }}
                />
                </PieChart>
            </ResponsiveContainer>
          ) : (
             <div className="flex items-center justify-center h-full text-gray-400">No expense data yet</div>
          )}
        </div>
      </div>

      {/* Recent List Mini */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 transition-colors">Recent Activity</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-slate-700">
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Merchant / Source</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {recentTransactions.map(t => (
                <tr key={t.id} className="border-b border-gray-50 dark:border-slate-700 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="py-4 text-gray-600 dark:text-gray-300">{t.date}</td>
                  <td className="py-4 font-medium text-gray-900 dark:text-white">{t.merchant || t.description}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        t.type === 'income' 
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'
                    }`}>
                      {t.category}
                    </span>
                  </td>
                  <td className={`py-4 text-right font-semibold ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                    {t.type === 'income' ? '+' : ''}{currencySymbol}{t.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
              {recentTransactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400 dark:text-gray-500">No transactions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;