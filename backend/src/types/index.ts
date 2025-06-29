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
  password: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface UserResponse {
  id: string;
  username: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
}

export interface TransactionFilters {
  search?: string;
  category?: string;
  status?: string;
  user?: string;
  dateFrom?: string;
  dateTo?: string;
  amountFrom?: number;
  amountTo?: number;
  page?: number;
  limit?: number;
}

export interface TransactionCreateRequest {
  date: string;
  amount: number;
  category: 'Revenue' | 'Expense';
  status: 'Paid' | 'Pending';
  description: string;
}

export interface TransactionUpdateRequest {
  date?: string;
  amount?: number;
  category?: 'Revenue' | 'Expense';
  status?: 'Paid' | 'Pending';
  description?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  pendingAmount: number;
  paidAmount: number;
  transactionCount: number;
  monthlyData: {
    month: string;
    revenue: number;
    expenses: number;
  }[];
}

export interface JwtPayload {
  userId: string;
  username: string;
  iat: number;
  exp: number;
} 