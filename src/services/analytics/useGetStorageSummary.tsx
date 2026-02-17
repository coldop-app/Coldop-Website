import { useQuery, queryOptions } from '@tanstack/react-query';
import storeAdminAxiosClient from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';

/** Size-level quantity in stock summary */
export interface SizeQuantity {
  size: string;
  initialQuantity: number;
  currentQuantity: number;
}

/** Variety-level stock summary */
export interface VarietyStockSummary {
  variety: string;
  sizes: SizeQuantity[];
}

/** Single point in chart flat series */
export interface ChartDataPoint {
  name: string;
  variety: string;
  size: string;
  initialQuantity: number;
  currentQuantity: number;
}

/** Chart-ready data for Recharts */
export interface ChartData {
  flatSeries: ChartDataPoint[];
  varieties: string[];
  sizes: string[];
}

/** Total inventory initial vs current */
export interface TotalInventory {
  initial: number;
  current: number;
}

/** Top variety by current quantity */
export interface TopVariety {
  variety: string;
  currentQuantity: number;
}

/** Top size by current quantity */
export interface TopSize {
  size: string;
  currentQuantity: number;
}

/** Full storage summary payload (scoped to authenticated user's cold storage) */
export interface StorageSummaryData {
  stockSummary: VarietyStockSummary[];
  chartData: ChartData;
  totalInventory: TotalInventory;
  topVariety: TopVariety | null;
  topSize: TopSize | null;
}

/** API response shape for GET /analytics/summary */
export interface GetStorageSummaryApiResponse {
  success: boolean;
  data: StorageSummaryData;
  message: string;
}

/** Query key factory */
export const storageSummaryKeys = {
  all: ['analytics'] as const,
  summary: () => [...storageSummaryKeys.all, 'summary'] as const,
};

/** Fetcher used by queryOptions and prefetch */
async function fetchStorageSummary(): Promise<StorageSummaryData> {
  const { data } =
    await storeAdminAxiosClient.get<GetStorageSummaryApiResponse>(
      '/analytics/summary'
    );

  if (!data.success || data.data == null) {
    throw new Error(data.message ?? 'Failed to fetch storage summary');
  }

  return data.data;
}

/** Query options – use with useQuery, prefetchQuery, or in loaders */
export const storageSummaryQueryOptions = () =>
  queryOptions({
    queryKey: storageSummaryKeys.summary(),
    queryFn: fetchStorageSummary,
  });

/** Hook to fetch stock summary for the authenticated store admin's cold storage. */
export function useGetStorageSummary() {
  return useQuery(storageSummaryQueryOptions());
}

/** Prefetch storage summary – e.g. before opening analytics page */
export function prefetchStorageSummary() {
  return queryClient.prefetchQuery(storageSummaryQueryOptions());
}
