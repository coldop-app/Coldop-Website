import { useQuery } from '@tanstack/react-query';

import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type { AnalyticsTopFarmersResponse } from '../types';

export const ANALYTICS_TOP_FARMERS_QUERY_KEY = ['analytics', 'top-farmers'] as const;

export async function fetchAnalyticsTopFarmersApi(): Promise<AnalyticsTopFarmersResponse> {
  const { data } = await apiClient.get<AnalyticsTopFarmersResponse>('/analytics/top-farmers');

  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'Failed to load top farmers');
  }

  return data;
}

async function fetchAnalyticsTopFarmers(): Promise<AnalyticsTopFarmersResponse> {
  try {
    return await fetchAnalyticsTopFarmersApi();
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load top farmers'), {
      cause: error,
    });
  }
}

type UseAnalyticsTopFarmersOptions = {
  enabled?: boolean;
};

export function useAnalyticsTopFarmers(options: UseAnalyticsTopFarmersOptions = {}) {
  const query = useQuery({
    queryKey: ANALYTICS_TOP_FARMERS_QUERY_KEY,
    queryFn: fetchAnalyticsTopFarmers,
    enabled: options.enabled ?? true,
  });

  return {
    response: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
