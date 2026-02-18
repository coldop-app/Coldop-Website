import { useQuery, queryOptions } from '@tanstack/react-query';
import storeAdminAxiosClient from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';

/** Single series point for Recharts (name + value) */
export interface TopFarmersDataPoint {
  name: string;
  value: number;
}

/** Chart-ready top farmers data (by current quantity, initial quantity, quantity removed) */
export interface TopFarmersChartData {
  byCurrentQuantity: TopFarmersDataPoint[];
  byInitialQuantity: TopFarmersDataPoint[];
  byQuantityRemoved: TopFarmersDataPoint[];
}

/** API response shape for GET /analytics/top-farmers */
export interface GetTopFarmersApiResponse {
  success: boolean;
  data: {
    chartData: TopFarmersChartData;
  };
  message: string;
}

/** Query key factory */
export const topFarmersKeys = {
  all: ['analytics'] as const,
  topFarmers: () => [...topFarmersKeys.all, 'top-farmers'] as const,
};

/** Fetcher used by queryOptions and prefetch */
async function fetchTopFarmers(): Promise<TopFarmersChartData> {
  const { data } =
    await storeAdminAxiosClient.get<GetTopFarmersApiResponse>(
      '/analytics/top-farmers'
    );

  if (!data.success || data.data?.chartData == null) {
    throw new Error(data.message ?? 'Failed to fetch top farmers');
  }

  return data.data.chartData;
}

/** Query options – use with useQuery, prefetchQuery, or in loaders */
export const topFarmersQueryOptions = () =>
  queryOptions({
    queryKey: topFarmersKeys.topFarmers(),
    queryFn: fetchTopFarmers,
  });

/** Hook to fetch top 5 farmers chart data (by current quantity, initial quantity, quantity removed) for the authenticated store. */
export function useGetTopFarmers() {
  return useQuery(topFarmersQueryOptions());
}

/** Prefetch top farmers – e.g. before opening analytics page */
export function prefetchTopFarmers() {
  return queryClient.prefetchQuery(topFarmersQueryOptions());
}
