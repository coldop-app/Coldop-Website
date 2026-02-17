import { useQuery, queryOptions } from '@tanstack/react-query';
import storeAdminAxiosClient from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';
import type { Preferences } from '@/types/preferences';

/** API response shape for GET /preferences/me */
export interface PreferencesApiResponse {
  success: boolean;
  data: Preferences | null;
  error?: {
    code: string;
    message: string;
  };
}

/** Query key factory */
export const preferencesKeys = {
  all: ['preferences'] as const,
  me: () => [...preferencesKeys.all, 'me'] as const,
};

/** Fetcher used by queryOptions and prefetch */
async function fetchMyPreferences(): Promise<Preferences> {
  const { data } =
    await storeAdminAxiosClient.get<PreferencesApiResponse>('/preferences/me');

  if (!data.success || data.data == null) {
    const message = data.error?.message ?? 'Failed to fetch preferences';
    throw new Error(message);
  }

  return data.data;
}

/** Query options – use with useQuery, prefetchQuery, or in loaders */
export const myPreferencesQueryOptions = () =>
  queryOptions({
    queryKey: preferencesKeys.me(),
    queryFn: fetchMyPreferences,
  });

/** Hook to fetch preferences for the authenticated store admin's cold storage. */
export function useGetPreferences() {
  return useQuery({
    ...myPreferencesQueryOptions(),
    staleTime: 5 * 60 * 1000, // 5 minutes – preferences change infrequently
  });
}

/** Prefetch preferences – e.g. before opening a form that needs commodity/size config */
export function prefetchMyPreferences() {
  return queryClient.prefetchQuery(myPreferencesQueryOptions());
}
