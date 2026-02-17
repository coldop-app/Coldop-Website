// src/store/useStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { StoreAdmin } from '@/types/store-admin';
import type { ColdStorage } from '@/types/cold-storage';
import type { Preferences } from '@/types/preferences';

interface StoreState {
  admin: Omit<StoreAdmin, 'password'> | null;
  coldStorage: ColdStorage | null;
  preferences: Preferences | null;
  token: string | null;
  isLoading: boolean;
  _hasHydrated: boolean;

  setAdminData: (
    admin: Omit<StoreAdmin, 'password'>,
    coldStorage: ColdStorage,
    token: string,
    preferences: Preferences | null
  ) => void;

  clearAdminData: () => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (state: boolean) => void;
}

type PersistedState = Pick<
  StoreState,
  'admin' | 'coldStorage' | 'preferences' | 'token'
>;

// ⏳ 1 week expiry in milliseconds
const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

// ⭐ Custom storage wrapper with expiry
const expiringStorage = {
  getItem: (name: string) => {
    const raw = localStorage.getItem(name);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw);
      const { timestamp, value } = parsed;

      if (Date.now() - timestamp > ONE_WEEK) {
        localStorage.removeItem(name);
        return null;
      }

      return value;
    } catch {
      return null;
    }
  },

  setItem: (name: string, value: unknown) => {
    localStorage.setItem(
      name,
      JSON.stringify({
        timestamp: Date.now(),
        value,
      })
    );
  },

  removeItem: (name: string) => {
    localStorage.removeItem(name);
  },
};

export const useStore = create(
  persist<StoreState, [], [], PersistedState>(
    (set, _get) => ({
      admin: null,
      coldStorage: null,
      preferences: null,
      token: null,
      isLoading: false,
      _hasHydrated: false,

      setAdminData: (admin, coldStorage, token, preferences) => {
        set({
          admin,
          coldStorage,
          preferences: preferences ?? null,
          token,
          isLoading: false,
        });
      },

      clearAdminData: () =>
        set({
          admin: null,
          coldStorage: null,
          preferences: null,
          token: null,
        }),

      setLoading: (loading) => set({ isLoading: loading }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),

    {
      name: 'store-storage',
      storage: expiringStorage,

      partialize: (state): PersistedState => ({
        admin: state.admin,
        coldStorage: state.coldStorage,
        preferences: state.preferences,
        token: state.token,
      }),

      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.setHasHydrated(true);
      },
    }
  )
);
