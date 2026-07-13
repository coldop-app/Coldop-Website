import { useQuery } from '@tanstack/react-query';

import type {
  IncomingGatePassRecord,
  IncomingGatePassesByFarmerLinkResponse,
} from '@/features/incoming/types/api';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export const INCOMING_GATE_PASSES_BY_FARMER_LINK_QUERY_KEY = [
  'incoming-gate-passes-by-farmer-link',
] as const;

export function incomingGatePassesByFarmerLinkQueryKey(farmerStorageLinkId: string) {
  return [...INCOMING_GATE_PASSES_BY_FARMER_LINK_QUERY_KEY, farmerStorageLinkId] as const;
}

export async function fetchIncomingGatePassesByFarmerLinkApi(
  farmerStorageLinkId: string,
): Promise<IncomingGatePassRecord[]> {
  const { data } = await apiClient.get<IncomingGatePassesByFarmerLinkResponse>(
    `/incoming-gate-pass/farmer-storage-link/${farmerStorageLinkId}`,
  );

  if (!data.success) {
    throw new Error(data.message ?? 'Failed to load incoming gate passes');
  }

  return data.data ?? [];
}

async function fetchIncomingGatePassesByFarmerLink(
  farmerStorageLinkId: string,
): Promise<IncomingGatePassRecord[]> {
  try {
    return await fetchIncomingGatePassesByFarmerLinkApi(farmerStorageLinkId);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load incoming gate passes'), {
      cause: error,
    });
  }
}

export function useIncomingGatePassesByFarmerLink(
  farmerStorageLinkId: string,
  options?: { enabled?: boolean },
) {
  const enabled = (options?.enabled ?? true) && farmerStorageLinkId.trim().length > 0;

  const query = useQuery({
    queryKey: incomingGatePassesByFarmerLinkQueryKey(farmerStorageLinkId),
    queryFn: () => fetchIncomingGatePassesByFarmerLink(farmerStorageLinkId),
    enabled,
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
