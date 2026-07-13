import { useQuery } from '@tanstack/react-query';

import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type { AnalyticsSummaryResponse } from '../types';

export const ANALYTICS_SUMMARY_QUERY_KEY = ['analytics', 'summary'] as const;

export type AnalyticsSummaryParams = {
  stockFilter?: boolean;
};

function analyticsSummaryQueryKey(params: AnalyticsSummaryParams = {}) {
  return [...ANALYTICS_SUMMARY_QUERY_KEY, params] as const;
}

export async function fetchAnalyticsSummaryApi(
  params: AnalyticsSummaryParams = {},
): Promise<AnalyticsSummaryResponse> {
  const { data } = await apiClient.get<AnalyticsSummaryResponse>('/analytics/summary', {
    params: params.stockFilter === true ? { stockFilter: 'true' } : undefined,
  });

  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'Failed to load analytics summary');
  }

  return data;
}

async function fetchAnalyticsSummary(
  params: AnalyticsSummaryParams = {},
): Promise<AnalyticsSummaryResponse> {
  try {
    return await fetchAnalyticsSummaryApi(params);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load analytics summary'), {
      cause: error,
    });
  }
}

type UseAnalyticsSummaryOptions = {
  enabled?: boolean;
};

export function useAnalyticsSummary(
  params: AnalyticsSummaryParams = {},
  options: UseAnalyticsSummaryOptions = {},
) {
  const query = useQuery({
    queryKey: analyticsSummaryQueryKey(params),
    queryFn: () => fetchAnalyticsSummary(params),
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
