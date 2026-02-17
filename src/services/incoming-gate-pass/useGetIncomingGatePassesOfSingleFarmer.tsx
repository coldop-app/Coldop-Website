import { useQuery, queryOptions } from '@tanstack/react-query';
import storeAdminAxiosClient from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';

/* -------------------------------------------------
   API response types (GET /incoming-gate-pass/farmer-storage-link/:id)
------------------------------------------------- */

export interface IncomingGatePassBagSizeLocation {
  chamber: string;
  floor: string;
  row: string;
}

export interface IncomingGatePassBagSize {
  name: string;
  initialQuantity: number;
  currentQuantity: number;
  location: IncomingGatePassBagSizeLocation;
}

export interface IncomingGatePassFarmerStorageLink {
  name: string;
  accountNumber: number;
  address: string;
  mobileNumber: string;
}

export interface IncomingGatePassCreatedBy {
  _id: string;
  name: string;
}

export interface IncomingGatePassItem {
  _id: string;
  farmerStorageLinkId: IncomingGatePassFarmerStorageLink;
  createdBy: IncomingGatePassCreatedBy;
  gatePassNo: number;
  date: string;
  type: 'RECEIPT' | 'TRANSFER';
  variety: string;
  truckNumber: string;
  bagSizes: IncomingGatePassBagSize[];
  status: string;
  remarks: string;
  manualParchiNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetIncomingGatePassesOfSingleFarmerApiResponse {
  success: boolean;
  data: IncomingGatePassItem[];
  message?: string;
}

/* -------------------------------------------------
   Query keys & fetcher
------------------------------------------------- */

export const incomingGatePassesOfFarmerKeys = {
  all: ['incoming-gate-pass'] as const,
  byFarmerStorageLink: (farmerStorageLinkId: string) =>
    [
      ...incomingGatePassesOfFarmerKeys.all,
      'farmer-storage-link',
      farmerStorageLinkId,
    ] as const,
};

async function fetchIncomingGatePassesOfSingleFarmer(
  farmerStorageLinkId: string
): Promise<IncomingGatePassItem[]> {
  const { data } =
    await storeAdminAxiosClient.get<GetIncomingGatePassesOfSingleFarmerApiResponse>(
      `/incoming-gate-pass/farmer-storage-link/${farmerStorageLinkId}`
    );

  if (!data.success || !Array.isArray(data.data)) {
    throw new Error(
      data.message ?? 'Failed to fetch incoming gate passes for farmer'
    );
  }

  return data.data;
}

/** Query options – use with useQuery, prefetchQuery, or in loaders */
export function incomingGatePassesOfFarmerQueryOptions(
  farmerStorageLinkId: string | undefined
) {
  return queryOptions({
    queryKey: incomingGatePassesOfFarmerKeys.byFarmerStorageLink(
      farmerStorageLinkId ?? ''
    ),
    queryFn: () => fetchIncomingGatePassesOfSingleFarmer(farmerStorageLinkId!),
    enabled: Boolean(farmerStorageLinkId),
  });
}

/**
 * Hook to fetch incoming gate passes for a single farmer (by farmer-storage-link id).
 * GET /incoming-gate-pass/farmer-storage-link/:farmerStorageLinkId
 * Query runs only when farmerStorageLinkId is truthy.
 */
export function useGetIncomingGatePassesOfSingleFarmer(
  farmerStorageLinkId: string | undefined
) {
  return useQuery(incomingGatePassesOfFarmerQueryOptions(farmerStorageLinkId));
}

/** Prefetch incoming gate passes for a farmer – e.g. before opening a detail view */
export function prefetchIncomingGatePassesOfSingleFarmer(
  farmerStorageLinkId: string
) {
  return queryClient.prefetchQuery(
    incomingGatePassesOfFarmerQueryOptions(farmerStorageLinkId)
  );
}
