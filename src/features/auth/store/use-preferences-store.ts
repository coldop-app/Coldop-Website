import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Preferences } from '../types';

interface PreferencesState {
  preferences: Preferences | null;
  setPreferences: (preferences: Preferences) => void;
  clearPreferences: () => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      preferences: null,
      setPreferences: (preferences) => set({ preferences }),
      clearPreferences: () => set({ preferences: null }),
    }),
    {
      name: 'preferences-storage',
    },
  ),
);
