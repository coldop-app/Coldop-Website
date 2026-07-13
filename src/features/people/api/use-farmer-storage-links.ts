import { useQuery } from '@tanstack/react-query';

import type { FarmerStorageLink, FarmerStorageLinksResponse } from '@/features/people/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export const FARMER_STORAGE_LINKS_QUERY_KEY = ['farmer-storage-links'] as const;

export async function fetchFarmerStorageLinksApi(): Promise<FarmerStorageLink[]> {
  const { data } = await apiClient.get<FarmerStorageLinksResponse>('/farmer-storage-link/');

  if (!data.success) {
    throw new Error('Failed to load people');
  }

  return data.data ?? [];
}

async function fetchFarmerStorageLinks(): Promise<FarmerStorageLink[]> {
  try {
    return await fetchFarmerStorageLinksApi();
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load people'), {
      cause: error,
    });
  }
}

export function useFarmerStorageLinks() {
  const query = useQuery({
    queryKey: FARMER_STORAGE_LINKS_QUERY_KEY,
    queryFn: fetchFarmerStorageLinks,
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
