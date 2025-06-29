import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState } from '../types';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (username: string, password: string) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simple validation for demo
        if (username === 'admin' && password === 'password') {
          const token = 'mock-jwt-token-' + Date.now();
          const user = { id: '1', username };
          
          set({
            user,
            token,
            isAuthenticated: true,
          });
          
          return true;
        }
        
        return false;
      },
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);