import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  setToken: (token: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      setToken: (accessToken) => set({ accessToken }),
      clearAuth: () => set({ accessToken: null }),
      isAuthenticated: () => !!get().accessToken,
    }),
    {
      name: 'auth-storage',
    },
  ),
);
