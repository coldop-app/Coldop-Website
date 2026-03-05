import { useQuery, type UseQueryResult, queryOptions } from '@tanstack/react-query';
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

/** When stockFilter=true, summary is grouped by filter key (e.g. FARMER, OWNED) */
export type StockSummaryByFilterData = Record<string, StorageSummaryData>;

/** API response shape for GET /analytics/summary (default) */
export interface GetStorageSummaryApiResponse {
  success: boolean;
  data: StorageSummaryData;
  message: string;
}

/** API response shape for GET /analytics/summary?stockFilter=true */
export interface GetStorageSummaryByFilterApiResponse {
  success: boolean;
  data: { stockSummaryByFilter: StockSummaryByFilterData };
  message: string;
}

/** Query key factory */
export const storageSummaryKeys = {
  all: ['analytics'] as const,
  summary: (stockFilter?: boolean) =>
    [...storageSummaryKeys.all, 'summary', stockFilter] as const,
};

/** Fetcher used by queryOptions and prefetch */
async function fetchStorageSummary(
  stockFilter?: boolean
): Promise<StorageSummaryData | StockSummaryByFilterData> {
  const params = new URLSearchParams();
  if (stockFilter === true) params.set('stockFilter', 'true');
  const url =
    '/analytics/summary' +
    (params.toString() ? '?' + params.toString() : '');

  const { data } =
    await storeAdminAxiosClient.get<
      GetStorageSummaryApiResponse | GetStorageSummaryByFilterApiResponse
    >(url);

  if (!data.success || data.data == null) {
    throw new Error(data.message ?? 'Failed to fetch storage summary');
  }

  if (stockFilter && 'stockSummaryByFilter' in data.data) {
    return data.data.stockSummaryByFilter;
  }

  return data.data as StorageSummaryData;
}

/** Options for the storage summary query */
export interface UseGetStorageSummaryOptions {
  /** When true, returns summary grouped by stock filter (e.g. FARMER, OWNED) */
  stockFilter?: boolean;
  /** When false, the query is not executed (e.g. when filter tabs are hidden). */
  enabled?: boolean;
}

/** Query options – use with useQuery, prefetchQuery, or in loaders */
export const storageSummaryQueryOptions = (
  options: UseGetStorageSummaryOptions = {}
) =>
  queryOptions({
    queryKey: storageSummaryKeys.summary(options.stockFilter),
    queryFn: () => fetchStorageSummary(options.stockFilter),
  });

/** Hook to fetch stock summary for the authenticated store admin's cold storage. */
export function useGetStorageSummary(
  options?: Omit<UseGetStorageSummaryOptions, 'stockFilter'> & {
    stockFilter?: false;
  }
): UseQueryResult<StorageSummaryData, Error>;
export function useGetStorageSummary(options: {
  stockFilter: true;
  enabled?: boolean;
}): UseQueryResult<StockSummaryByFilterData, Error>;
export function useGetStorageSummary(
  options: UseGetStorageSummaryOptions = {}
): UseQueryResult<StorageSummaryData | StockSummaryByFilterData, Error> {
  const { enabled = true, ...queryOptions } = options;
  return useQuery({
    ...storageSummaryQueryOptions({ ...queryOptions }),
    enabled,
  });
}

/** Prefetch storage summary – e.g. before opening analytics page */
export function prefetchStorageSummary(
  options: UseGetStorageSummaryOptions = {}
) {
  return queryClient.prefetchQuery(storageSummaryQueryOptions(options));
}
