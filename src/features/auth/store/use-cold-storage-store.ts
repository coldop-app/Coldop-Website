import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ColdStorage } from '../types';

interface ColdStorageState {
  coldStorage: ColdStorage | null;
  setColdStorage: (coldStorage: ColdStorage) => void;
  clearColdStorage: () => void;
}

export const useColdStorageStore = create<ColdStorageState>()(
  persist(
    (set) => ({
      coldStorage: null,
      setColdStorage: (coldStorage) => set({ coldStorage }),
      clearColdStorage: () => set({ coldStorage: null }),
    }),
    {
      name: 'cold-storage-storage',
    },
  ),
);
