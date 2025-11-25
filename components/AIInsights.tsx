import React, { useEffect, useState } from 'react';
import { Transaction, Currency } from '../types';
import { generateInsights } from '../services/geminiService';
import { Sparkles, Loader2, Lightbulb, RefreshCw } from 'lucide-react';

interface AIInsightsProps {
  expenses: Transaction[]; 
  currency?: Currency;
}

const AIInsights: React.FC<AIInsightsProps> = ({ expenses: transactions, currency = 'USD' }) => {
  const [insightText, setInsightText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [hasFetched, setHasFetched] = useState<boolean>(false);

  const fetchInsights = async () => {
    if (transactions.length === 0) {
      setInsightText("Please add some income or expenses so I can analyze your financial habits!");
      setHasFetched(true);
      return;
    }

    setLoading(true);
    try {
      const result = await generateInsights(transactions, currency as Currency);
      setInsightText(result);
    } catch (e) {
      setInsightText("Failed to retrieve insights. Please try again later.");
    } finally {
      setLoading(false);
      setHasFetched(true);
    }
  };

  useEffect(() => {
    // Auto fetch on first load if we haven't yet
    if (!hasFetched && transactions.length > 0) {
      fetchInsights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Simple Markdown renderer (bold and lists)
  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, idx) => {
      // Heading
      if (line.startsWith('##')) return <h3 key={idx} className="text-xl font-bold text-gray-800 dark:text-white mt-6 mb-3 transition-colors">{line.replace('##', '').trim()}</h3>;
      if (line.startsWith('#')) return <h2 key={idx} className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-4 transition-colors">{line.replace('#', '').trim()}</h2>;
      
      // List item
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <li key={idx} className="ml-4 mb-2 text-gray-700 dark:text-gray-300 flex items-start gap-2 transition-colors">
            <span className="mt-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0"></span>
            <span>
                {line.replace(/^[-*]\s/, '').split('**').map((part, i) => 
                    i % 2 === 1 ? <strong key={i} className="text-gray-900 dark:text-white font-semibold">{part}</strong> : part
                )}
            </span>
          </li>
        );
      }

      // Numbered list
      if (/^\d+\./.test(line.trim())) {
         return (
             <li key={idx} className="ml-4 mb-2 text-gray-700 dark:text-gray-300 list-decimal pl-2 transition-colors">
                 {line.replace(/^\d+\.\s/, '').split('**').map((part, i) => 
                    i % 2 === 1 ? <strong key={i} className="text-gray-900 dark:text-white font-semibold">{part}</strong> : part
                )}
             </li>
         )
      }

      // Normal paragraph with bold support
      if (line.trim() === '') return <br key={idx} />;
      
      return (
        <p key={idx} className="mb-2 text-gray-700 dark:text-gray-300 leading-relaxed transition-colors">
           {line.split('**').map((part, i) => 
              i % 2 === 1 ? <strong key={i} className="text-gray-900 dark:text-white font-semibold">{part}</strong> : part
           )}
        </p>
      );
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="text-yellow-300" size={28} />
            <h2 className="text-3xl font-bold">AI Financial Analyst</h2>
          </div>
          <p className="text-indigo-100 text-lg max-w-2xl">
            Get personalized insights on your income vs spending, savings opportunities, and financial health using Google Gemini.
          </p>
        </div>
        {/* Background decorative circles */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-purple-400 opacity-20 rounded-full blur-2xl"></div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-8 min-h-[400px] transition-colors">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="bg-gray-100 dark:bg-slate-700 p-4 rounded-full mb-4 transition-colors">
              <Lightbulb className="text-gray-400 dark:text-gray-300" size={40} />
            </div>
            <h3 className="text-xl font-medium text-gray-800 dark:text-white transition-colors">No Data Available</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2 transition-colors">Add transactions to generate insights.</p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
             <Loader2 size={48} className="text-primary animate-spin mb-4" />
             <p className="text-lg font-medium text-gray-700 dark:text-gray-300 transition-colors">Analyzing your finances...</p>
             <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 transition-colors">Gemini is crunching the numbers.</p>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-slate-700 pb-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2 transition-colors">
                Your Financial Report
              </h3>
              <button 
                onClick={fetchInsights}
                className="flex items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors font-medium"
              >
                <RefreshCw size={16} />
                Refresh Analysis
              </button>
            </div>
            
            <div className="prose prose-indigo dark:prose-invert max-w-none">
              {renderMarkdown(insightText)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;