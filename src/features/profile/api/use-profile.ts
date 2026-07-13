import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { syncProfileToStores } from '@/features/auth/store/sync-profile-to-stores';
import { useColdStorageStore } from '@/features/auth/store/use-cold-storage-store';
import { usePreferencesStore } from '@/features/auth/store/use-preferences-store';
import { useStoreAdminStore } from '@/features/auth/store/use-store-admin-store';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';
import type { ProfileData, ProfileResponse } from '../types';
import { buildProfilePlaceholder } from '../utils/build-profile-placeholder';

export const PROFILE_QUERY_KEY = ['profile', 'me'] as const;

async function fetchProfile(): Promise<ProfileData> {
  try {
    const { data } = await apiClient.get<ProfileResponse>('/store-admin/profile');

    if (!data.success || !data.data) {
      throw new Error('Failed to load profile');
    }

    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load profile'), {
      cause: error,
    });
  }
}

export function useProfile() {
  const storeAdmin = useStoreAdminStore((state) => state.storeAdmin);
  const coldStorage = useColdStorageStore((state) => state.coldStorage);
  const preferences = usePreferencesStore((state) => state.preferences);

  const placeholderData = useMemo(
    () => buildProfilePlaceholder(storeAdmin, coldStorage, preferences),
    [storeAdmin, coldStorage, preferences],
  );

  const query = useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: fetchProfile,
    placeholderData,
  });

  useEffect(() => {
    if (query.data) {
      syncProfileToStores(query.data);
    }
  }, [query.data]);

  return {
    profile: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
