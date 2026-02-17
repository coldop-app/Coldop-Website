import { useQuery, queryOptions } from '@tanstack/react-query';
import storeAdminAxiosClient from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';
import type {
  DaybookEntry,
  DaybookPagination,
} from '@/services/store-admin/functions/useGetDaybook';

/** API response shape for GET /store-admin/farmer-storage-links/:id/gate-passes */
export interface FarmerGatePassesApiResponse {
  status: string;
  data: DaybookEntry[];
  pagination: DaybookPagination;
  message?: string;
}

/** Result shape: incoming (RECEIPT) and outgoing (DELIVERY) gate passes for a farmer link */
export interface FarmerGatePassesData {
  incoming: DaybookEntry[];
  outgoing: DaybookEntry[];
  pagination: DaybookPagination;
}

/** Optional date range filter – YYYY-MM-DD strings for API */
export interface FarmerGatePassesDateRange {
  from?: string;
  to?: string;
}

/** Query params for gate passes API: type (all | incoming | outgoing), sortBy (latest | oldest), from, to (YYYY-MM-DD) */
export interface FarmerGatePassesParams {
  dateRange?: FarmerGatePassesDateRange;
  type?: 'all' | 'incoming' | 'outgoing';
  sortBy?: 'latest' | 'oldest';
}

/** Query key factory – use for invalidation and consistent keys */
export const farmerGatePassesKeys = {
  all: ['store-admin', 'farmer-gate-passes'] as const,
  lists: () => [...farmerGatePassesKeys.all, 'list'] as const,
  list: (farmerStorageLinkId: string, params?: FarmerGatePassesParams) =>
    [
      ...farmerGatePassesKeys.lists(),
      farmerStorageLinkId,
      params?.dateRange?.from ?? '',
      params?.dateRange?.to ?? '',
      params?.type ?? 'all',
      params?.sortBy ?? 'latest',
    ] as const,
};

/** Fetcher used by queryOptions and prefetch – single request with type, sortBy, from, to. API may omit top-level type for DELIVERY; use orderDetails as fallback. */
async function fetchFarmerGatePasses(
  farmerStorageLinkId: string,
  params?: FarmerGatePassesParams
): Promise<FarmerGatePassesData> {
  const query: Record<string, string> = {
    type: params?.type ?? 'all',
    sortBy: params?.sortBy ?? 'latest',
  };
  if (params?.dateRange?.from) query.from = params.dateRange.from;
  if (params?.dateRange?.to) query.to = params.dateRange.to;

  const { data } = await storeAdminAxiosClient.get<FarmerGatePassesApiResponse>(
    `/store-admin/farmer-storage-links/${farmerStorageLinkId}/gate-passes`,
    { params: query }
  );

  if (data.status !== 'Success' || data.data == null) {
    throw new Error(data.message ?? 'Failed to fetch farmer gate passes');
  }

  const raw = data.data ?? [];
  const incoming: DaybookEntry[] = [];
  const outgoing: DaybookEntry[] = [];
  for (const e of raw) {
    const entry = {
      ...e,
      type: e.type ?? (e.orderDetails?.length ? 'DELIVERY' : 'RECEIPT'),
    } as DaybookEntry;
    if (entry.type === 'RECEIPT') {
      incoming.push(entry);
    } else {
      outgoing.push(entry);
    }
  }

  return {
    incoming,
    outgoing,
    pagination: data.pagination,
  };
}

/** Query options – use with useQuery, prefetchQuery, or in loaders */
export function farmerGatePassesQueryOptions(
  farmerStorageLinkId: string,
  params?: FarmerGatePassesParams
) {
  return queryOptions({
    queryKey: farmerGatePassesKeys.list(farmerStorageLinkId, params),
    queryFn: () => fetchFarmerGatePasses(farmerStorageLinkId, params),
    enabled: Boolean(farmerStorageLinkId),
  });
}

/** Hook to fetch incoming and outgoing gate passes for a farmer–storage link */
export function useGetFarmerGatePasses(
  farmerStorageLinkId: string | undefined,
  params?: FarmerGatePassesParams
) {
  return useQuery({
    ...farmerGatePassesQueryOptions(farmerStorageLinkId ?? '', params),
    enabled: Boolean(farmerStorageLinkId),
  });
}

/** Prefetch farmer gate passes – e.g. before navigating to people/:farmerStorageLinkId */
export function prefetchFarmerGatePasses(
  farmerStorageLinkId: string,
  params?: FarmerGatePassesParams
) {
  return queryClient.prefetchQuery(
    farmerGatePassesQueryOptions(farmerStorageLinkId, params)
  );
}
