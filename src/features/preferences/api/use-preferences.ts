import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { usePreferencesStore } from '@/features/auth/store/use-preferences-store';
import type { Preferences } from '@/features/auth/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export const PREFERENCES_QUERY_KEY = ['preferences', 'me'] as const;

interface PreferencesResponse {
  success: boolean;
  data: Preferences | null;
}

async function fetchMyPreferences(): Promise<Preferences> {
  try {
    const { data } = await apiClient.get<PreferencesResponse>('/preferences/me');

    if (!data.success || !data.data) {
      throw new Error('Failed to load preferences');
    }

    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load preferences'), {
      cause: error,
    });
  }
}

export function usePreferences() {
  const cachedPreferences = usePreferencesStore((state) => state.preferences);
  const setPreferences = usePreferencesStore((state) => state.setPreferences);

  const query = useQuery({
    queryKey: PREFERENCES_QUERY_KEY,
    queryFn: fetchMyPreferences,
    placeholderData: cachedPreferences ?? undefined,
  });

  useEffect(() => {
    if (query.data) {
      setPreferences(query.data);
    }
  }, [query.data, setPreferences]);

  return {
    preferences: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
