import type { ColdStoragePopulated, StoreAdmin, StoreAdminPopulated } from '../types';
import type { ProfileData } from '@/features/profile/types';
import { useColdStorageStore } from './use-cold-storage-store';
import { usePreferencesStore } from './use-preferences-store';
import { useStoreAdminStore } from './use-store-admin-store';

type ProfileSyncInput = ProfileData | StoreAdminPopulated;

function normalizeProfileInput(input: ProfileSyncInput): {
  storeAdmin: Omit<StoreAdmin, 'coldStorageId'> & {
    failedLoginAttempts?: number;
    lockedUntil?: string;
  };
  coldStorage: ColdStoragePopulated;
} {
  if ('coldStorage' in input) {
    return input;
  }

  const { coldStorageId: coldStorage, ...storeAdmin } = input;
  return { storeAdmin, coldStorage };
}

export function syncProfileToStores(input: ProfileSyncInput) {
  const { storeAdmin, coldStorage } = normalizeProfileInput(input);
  const { preferencesId: preferences, ...coldStorageFields } = coldStorage;
  const {
    failedLoginAttempts: _failedLoginAttempts,
    lockedUntil: _lockedUntil,
    ...adminFields
  } = storeAdmin;

  useStoreAdminStore.getState().setStoreAdmin({
    ...adminFields,
    coldStorageId: coldStorage._id,
  });
  useColdStorageStore.getState().setColdStorage({
    ...coldStorageFields,
    preferencesId: preferences._id,
  });
  usePreferencesStore.getState().setPreferences(preferences);
}
