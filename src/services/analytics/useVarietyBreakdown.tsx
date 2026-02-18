import { useQuery, queryOptions } from '@tanstack/react-query';
import storeAdminAxiosClient from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';

/** Per-farmer contribution for a size in variety breakdown */
export interface VarietyBreakdownFarmer {
  farmerName: string;
  initialQuantity: number;
  currentQuantity: number;
  quantityRemoved: number;
}

/** Size-level breakdown with farmer contributions */
export interface VarietyBreakdownSize {
  size: string;
  initialQuantity: number;
  currentQuantity: number;
  quantityRemoved: number;
  farmerBreakdown: VarietyBreakdownFarmer[];
}

/** Variety breakdown result (variety + sizes with farmer breakdown) */
export interface VarietyBreakdownData {
  variety: string;
  sizes: VarietyBreakdownSize[];
}

/** API response shape for GET /analytics/variety-breakdown */
export interface GetVarietyBreakdownApiResponse {
  success: boolean;
  data: VarietyBreakdownData;
  message: string;
}

/** Query key factory */
export const varietyBreakdownKeys = {
  all: ['analytics', 'variety-breakdown'] as const,
  detail: (variety: string) =>
    [...varietyBreakdownKeys.all, variety] as const,
};

/** Fetcher used by queryOptions and prefetch */
async function fetchVarietyBreakdown(
  variety: string
): Promise<VarietyBreakdownData> {
  const { data } =
    await storeAdminAxiosClient.get<GetVarietyBreakdownApiResponse>(
      '/analytics/variety-breakdown',
      { params: { variety } }
    );

  if (!data.success || data.data == null) {
    throw new Error(data.message ?? 'Failed to fetch variety breakdown');
  }

  return data.data;
}

/** Query options – use with useQuery, prefetchQuery, or in loaders */
export const varietyBreakdownQueryOptions = (variety: string) =>
  queryOptions({
    queryKey: varietyBreakdownKeys.detail(variety),
    queryFn: () => fetchVarietyBreakdown(variety),
  });

/** Hook to fetch variety breakdown (sizes + per-farmer contribution) for the given variety. Scoped to authenticated store. */
export function useVarietyBreakdown(variety: string) {
  return useQuery({
    ...varietyBreakdownQueryOptions(variety),
    enabled: !!variety?.trim(),
  });
}

/** Prefetch variety breakdown – e.g. before opening a variety detail view */
export function prefetchVarietyBreakdown(variety: string) {
  if (!variety?.trim()) return Promise.resolve();
  return queryClient.prefetchQuery(varietyBreakdownQueryOptions(variety));
}
