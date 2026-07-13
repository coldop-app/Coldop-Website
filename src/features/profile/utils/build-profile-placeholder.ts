import type { ColdStorage, Preferences, StoreAdmin } from '@/features/auth/types';
import type { ProfileData } from '../types';

export function buildProfilePlaceholder(
  storeAdmin: StoreAdmin | null,
  coldStorage: ColdStorage | null,
  preferences: Preferences | null,
): ProfileData | undefined {
  if (!storeAdmin || !coldStorage) {
    return undefined;
  }

  const populatedPreferences: Preferences = preferences ?? {
    _id: typeof coldStorage.preferencesId === 'string' ? coldStorage.preferencesId : '',
    commodities: [],
    reportFormat: 'default',
    showFinances: false,
    labourCost: 0,
    customFields: {},
    createdAt: coldStorage.createdAt,
    updatedAt: coldStorage.updatedAt,
  };

  return {
    storeAdmin,
    coldStorage: {
      ...coldStorage,
      preferencesId: populatedPreferences,
    },
  };
}
