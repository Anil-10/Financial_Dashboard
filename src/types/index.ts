export interface Transaction {
  id: number;
  date: string;
  amount: number;
  category: 'Revenue' | 'Expense';
  status: 'Paid' | 'Pending';
  user_id: string;
  user_profile: string;
  description: string;
}

export interface User {
  id: string;
  username: string;
  token?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export interface TransactionFilters {
  search: string;
  category: string;
  status: string;
  user: string;
  dateFrom: Date | null;
  dateTo: Date | null;
  amountFrom: number | null;
  amountTo: number | null;
}