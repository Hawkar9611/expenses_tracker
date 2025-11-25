import { Transaction } from '../types';

const STORAGE_KEY = 'gemini_expenses_data';

export const getTransactions = (): Transaction[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    
    // Migration: ensure legacy data has a type
    return parsed.map((item: any) => ({
      ...item,
      type: item.type || 'expense'
    }));
  } catch (error) {
    console.error("Failed to load transactions", error);
    return [];
  }
};

export const saveTransactions = (transactions: Transaction[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (error) {
    console.error("Failed to save transactions", error);
  }
};
