import { useQuery } from '@tanstack/react-query';

import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type { LocationAnalyticsResponse } from '../types';
import { normalizeLocationAnalyticsData } from '../utils/normalize-location-analytics-data';

export const LOCATION_ANALYTICS_QUERY_KEY = ['analytics', 'location-analytics'] as const;

export async function fetchLocationAnalyticsApi(): Promise<LocationAnalyticsResponse> {
  const { data } = await apiClient.get<LocationAnalyticsResponse>('/analytics/location-analytics');

  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'Failed to load location analytics');
  }

  return {
    ...data,
    data: normalizeLocationAnalyticsData(data.data),
  };
}

async function fetchLocationAnalytics(): Promise<LocationAnalyticsResponse> {
  try {
    return await fetchLocationAnalyticsApi();
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load location analytics'), {
      cause: error,
    });
  }
}

type UseLocationAnalyticsOptions = {
  enabled?: boolean;
};

export function useLocationAnalytics(options: UseLocationAnalyticsOptions = {}) {
  const query = useQuery({
    queryKey: LOCATION_ANALYTICS_QUERY_KEY,
    queryFn: fetchLocationAnalytics,
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
