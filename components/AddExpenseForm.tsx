import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, CheckCircle2, Loader2, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Transaction, TransactionType, ExpenseCategory, IncomeCategory, Currency, CurrencyConfig } from '../types';
import { parseReceiptImage } from '../services/geminiService';

interface AddTransactionFormProps {
  onAddTransaction: (transaction: Transaction) => void;
  onCancel: () => void;
  currency: Currency;
}

const AddTransactionForm: React.FC<AddTransactionFormProps> = ({ onAddTransaction, onCancel, currency }) => {
  const [transactionType, setTransactionType] = useState<TransactionType>('expense');
  const currencySymbol = CurrencyConfig[currency].symbol;
  
  const [formData, setFormData] = useState<Partial<Transaction>>({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    category: ExpenseCategory.FOOD,
    description: '',
    merchant: '',
  });
  
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update category default when type changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      category: transactionType === 'expense' ? ExpenseCategory.FOOD : IncomeCategory.SALARY
    }));
  }, [transactionType]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (transactionType === 'income') {
        setError("Receipt scanning is primarily for expenses.");
        return;
    }

    setIsScanning(true);
    setError(null);

    try {
      // Call Gemini Service
      const extractedData = await parseReceiptImage(file);
      
      setFormData(prev => ({
        ...prev,
        ...extractedData,
        // Ensure date is string if returned undefined
        date: extractedData.date || prev.date,
        description: extractedData.description || extractedData.merchant || '',
        type: 'expense'
      }));
    } catch (err) {
      setError("Failed to read receipt. Please try again or enter details manually.");
    } finally {
      setIsScanning(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description || !formData.date) {
      setError("Please fill in all required fields.");
      return;
    }

    const newTransaction: Transaction = {
      id: uuidv4(),
      amount: formData.amount,
      type: transactionType,
      category: formData.category!,
      date: formData.date,
      description: formData.description,
      merchant: formData.merchant || formData.description,
    };

    onAddTransaction(newTransaction);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 animate-fade-in transition-colors">
      <header className="mb-8 border-b border-gray-100 dark:border-slate-700 pb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white transition-colors">Add Transaction</h2>
        <p className="text-gray-500 dark:text-gray-400 transition-colors">Record your income or expenses</p>
      </header>

      {/* Type Toggle */}
      <div className="flex p-1 bg-gray-100 dark:bg-slate-700 rounded-xl mb-8">
        <button
          type="button"
          onClick={() => setTransactionType('expense')}
          className={`
            flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-all duration-200
            ${transactionType === 'expense' 
              ? 'bg-white dark:bg-slate-600 text-red-600 dark:text-red-400 shadow-sm' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}
          `}
        >
          <TrendingDown size={18} />
          Expense
        </button>
        <button
          type="button"
          onClick={() => setTransactionType('income')}
          className={`
            flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-all duration-200
            ${transactionType === 'income' 
              ? 'bg-white dark:bg-slate-600 text-emerald-600 dark:text-emerald-400 shadow-sm' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}
          `}
        >
          <TrendingUp size={18} />
          Income
        </button>
      </div>

      {/* AI Scan Section - Only for Expenses */}
      {transactionType === 'expense' && (
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">Smart Scan (Receipts)</label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
              ${isScanning 
                ? 'border-primary bg-indigo-50 dark:bg-indigo-900/20' 
                : 'border-gray-300 dark:border-slate-600 hover:border-primary hover:bg-gray-50 dark:hover:bg-slate-700'}
            `}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
            
            {isScanning ? (
              <div className="flex flex-col items-center text-primary dark:text-indigo-400">
                <Loader2 size={40} className="animate-spin mb-2" />
                <span className="font-medium">Analyzing Receipt...</span>
                <span className="text-xs text-indigo-400 dark:text-indigo-300 mt-1">This may take a few seconds</span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
                <div className="bg-gray-100 dark:bg-slate-700 p-3 rounded-full mb-3 transition-colors">
                   <Camera size={32} className="text-gray-600 dark:text-gray-300" />
                </div>
                <span className="font-medium text-gray-900 dark:text-white transition-colors">Click to upload receipt</span>
                <span className="text-xs mt-1">Supports JPG, PNG</span>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-lg flex items-center gap-2 text-sm transition-colors">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Amount ({currencySymbol})</label>
            <input
              type="number"
              name="amount"
              step="0.01"
              value={formData.amount}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
            {transactionType === 'expense' ? 'Merchant / Store' : 'Payer / Source'}
          </label>
          <input
            type="text"
            name="merchant"
            value={formData.merchant}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
            placeholder={transactionType === 'expense' ? "e.g. Starbucks, Amazon" : "e.g. Employer, Client, Friend"}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
          >
            {transactionType === 'expense' 
              ? Object.values(ExpenseCategory).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))
              : Object.values(IncomeCategory).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))
            }
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
            placeholder="Details about the transaction..."
            required
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`
                flex-1 px-6 py-3 text-white font-medium rounded-lg transition-colors shadow-lg flex items-center justify-center gap-2
                ${transactionType === 'income' 
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 dark:shadow-none' 
                    : 'bg-primary hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none'}
            `}
          >
            <CheckCircle2 size={18} />
            Save {transactionType === 'income' ? 'Income' : 'Expense'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTransactionForm;