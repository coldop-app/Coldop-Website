import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StoreAdmin } from '../types';

interface StoreAdminState {
  storeAdmin: StoreAdmin | null;
  setStoreAdmin: (storeAdmin: StoreAdmin) => void;
  clearStoreAdmin: () => void;
}

export const useStoreAdminStore = create<StoreAdminState>()(
  persist(
    (set) => ({
      storeAdmin: null,
      setStoreAdmin: (storeAdmin) => set({ storeAdmin }),
      clearStoreAdmin: () => set({ storeAdmin: null }),
    }),
    {
      name: 'store-admin-storage',
    },
  ),
);
