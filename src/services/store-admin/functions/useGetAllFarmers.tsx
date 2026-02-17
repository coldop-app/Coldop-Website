import { useQuery, queryOptions } from '@tanstack/react-query';
import storeAdminAxiosClient from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';
import type { FarmerStorageLink } from '@/types/farmer';

/** API response shape for farmer-storage-links list */
export interface FarmerStorageLinksApiResponse {
  success: boolean;
  data: FarmerStorageLink[] | null;
  message?: string;
}

/** Query key factory – use for invalidation and consistent keys */
export const farmerStorageLinksKeys = {
  all: ['store-admin', 'farmer-storage-links'] as const,
  lists: () => [...farmerStorageLinksKeys.all, 'list'] as const,
  list: () => [...farmerStorageLinksKeys.lists()] as const,
};

/** Fetcher used by queryOptions and prefetch */
async function fetchFarmerStorageLinks(): Promise<FarmerStorageLink[]> {
  const { data } =
    await storeAdminAxiosClient.get<FarmerStorageLinksApiResponse>(
      '/store-admin/farmer-storage-links'
    );

  if (!data.success || data.data == null) {
    throw new Error(data.message ?? 'Failed to fetch farmer storage links');
  }

  return data.data;
}

/** Query options – use with useQuery, prefetchQuery, or in loaders */
export const farmerStorageLinksQueryOptions = () =>
  queryOptions({
    queryKey: farmerStorageLinksKeys.list(),
    queryFn: fetchFarmerStorageLinks,
  });

/** Hook to fetch farmer–storage links (each has farmerId, accountNumber, isActive, etc.) */
export function useGetAllFarmers() {
  return useQuery(farmerStorageLinksQueryOptions());
}

/** Prefetch farmer storage links – e.g. on route hover or before navigation */
export function prefetchFarmerStorageLinks() {
  return queryClient.prefetchQuery(farmerStorageLinksQueryOptions());
}

/** Alias for prefetch – use when prefetching “all farmers” before navigation */
export const prefetchAllFarmers = prefetchFarmerStorageLinks;
