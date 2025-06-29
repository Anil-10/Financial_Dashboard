import { create } from 'zustand';
import { Transaction, TransactionFilters } from '../types';
import transactionsData from '../data/transactions.json';

interface TransactionState {
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  filters: TransactionFilters;
  loading: boolean;
  error: string | null;
  setFilters: (filters: Partial<TransactionFilters>) => void;
  applyFilters: () => void;
  exportToCsv: (selectedColumns: string[]) => void;
}

const initialFilters: TransactionFilters = {
  search: '',
  category: '',
  status: '',
  user: '',
  dateFrom: null,
  dateTo: null,
  amountFrom: null,
  amountTo: null,
};

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: transactionsData as Transaction[],
  filteredTransactions: transactionsData as Transaction[],
  filters: initialFilters,
  loading: false,
  error: null,
  
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    }));
    get().applyFilters();
  },
  
  applyFilters: () => {
    const { transactions, filters } = get();
    
    let filtered = transactions.filter((transaction) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          transaction.description.toLowerCase().includes(searchLower) ||
          transaction.user_id.toLowerCase().includes(searchLower) ||
          transaction.amount.toString().includes(searchLower);
        
        if (!matchesSearch) return false;
      }
      
      // Category filter
      if (filters.category && transaction.category !== filters.category) {
        return false;
      }
      
      // Status filter
      if (filters.status && transaction.status !== filters.status) {
        return false;
      }
      
      // User filter
      if (filters.user && transaction.user_id !== filters.user) {
        return false;
      }
      
      // Date range filter
      const transactionDate = new Date(transaction.date);
      if (filters.dateFrom && transactionDate < filters.dateFrom) {
        return false;
      }
      if (filters.dateTo && transactionDate > filters.dateTo) {
        return false;
      }
      
      // Amount range filter
      if (filters.amountFrom !== null && transaction.amount < filters.amountFrom) {
        return false;
      }
      if (filters.amountTo !== null && transaction.amount > filters.amountTo) {
        return false;
      }
      
      return true;
    });
    
    set({ filteredTransactions: filtered });
  },
  
  exportToCsv: (selectedColumns) => {
    const { filteredTransactions } = get();
    
    const headers = selectedColumns.join(',');
    const rows = filteredTransactions.map(transaction => {
      return selectedColumns.map(column => {
        switch (column) {
          case 'date':
            return new Date(transaction.date).toLocaleDateString();
          case 'amount':
            return `₹${transaction.amount.toFixed(2)}`;
          case 'category':
            return transaction.category;
          case 'status':
            return transaction.status;
          case 'user':
            return transaction.user_id;
          case 'description':
            return `"${transaction.description}"`;
          default:
            return '';
        }
      }).join(',');
    });
    
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  },
}));