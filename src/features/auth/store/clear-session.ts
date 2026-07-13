import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from './use-auth-store';
import { useColdStorageStore } from './use-cold-storage-store';
import { usePreferencesStore } from './use-preferences-store';
import { useStoreAdminStore } from './use-store-admin-store';

const persistedStores = [
  useAuthStore,
  useStoreAdminStore,
  useColdStorageStore,
  usePreferencesStore,
] as const;

export function clearSession() {
  useAuthStore.getState().clearAuth();
  useStoreAdminStore.getState().clearStoreAdmin();
  useColdStorageStore.getState().clearColdStorage();
  usePreferencesStore.getState().clearPreferences();

  for (const store of persistedStores) {
    store.persist.clearStorage();
  }

  if (typeof window !== 'undefined') {
    localStorage.clear();
  }

  queryClient.clear();
}
