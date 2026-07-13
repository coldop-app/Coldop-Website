import { useQuery } from '@tanstack/react-query';

import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type { VarietyBreakdownResponse, VarietyBreakdownStockFilter } from '../types';

export const VARIETY_BREAKDOWN_QUERY_KEY = ['analytics', 'variety-breakdown'] as const;

export type VarietyBreakdownParams = {
  variety: string;
  stockFilter?: VarietyBreakdownStockFilter;
};

function varietyBreakdownQueryKey(params: VarietyBreakdownParams) {
  return [...VARIETY_BREAKDOWN_QUERY_KEY, params] as const;
}

export async function fetchVarietyBreakdownApi(
  params: VarietyBreakdownParams,
): Promise<VarietyBreakdownResponse> {
  const { data } = await apiClient.get<VarietyBreakdownResponse>('/analytics/variety-breakdown', {
    params: {
      variety: params.variety,
      ...(params.stockFilter ? { stockFilter: params.stockFilter } : {}),
    },
  });

  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'Failed to load variety breakdown');
  }

  return data;
}

async function fetchVarietyBreakdown(
  params: VarietyBreakdownParams,
): Promise<VarietyBreakdownResponse> {
  try {
    return await fetchVarietyBreakdownApi(params);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load variety breakdown'), {
      cause: error,
    });
  }
}

type UseVarietyBreakdownOptions = {
  enabled?: boolean;
};

export function useVarietyBreakdown(
  params: VarietyBreakdownParams,
  options: UseVarietyBreakdownOptions = {},
) {
  const query = useQuery({
    queryKey: varietyBreakdownQueryKey(params),
    queryFn: () => fetchVarietyBreakdown(params),
    enabled: (options.enabled ?? true) && Boolean(params.variety),
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
