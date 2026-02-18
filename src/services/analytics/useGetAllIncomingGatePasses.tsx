import { useQuery, queryOptions } from '@tanstack/react-query';
import storeAdminAxiosClient from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';

/** Location within cold storage */
export interface IncomingGatePassLocation {
  chamber: string;
  floor: string;
  row: string;
}

/** Bag size entry in an incoming gate pass */
export interface IncomingGatePassBagSize {
  name: string;
  initialQuantity: number;
  currentQuantity: number;
  location: IncomingGatePassLocation;
}

/** Farmer reference in farmerStorageLinkId */
export interface IncomingGatePassFarmer {
  _id: string;
  name: string;
  address: string;
  mobileNumber: string;
}

/** Farmer–storage link in gate pass */
export interface IncomingGatePassFarmerStorageLink {
  _id: string;
  farmerId: IncomingGatePassFarmer;
  accountNumber: number;
}

/** User who created the gate pass */
export interface IncomingGatePassCreatedBy {
  _id: string;
  name: string;
}

/** Single incoming gate pass from GET /analytics/incoming-gate-passes */
export interface IncomingGatePass {
  _id: string;
  farmerStorageLinkId: IncomingGatePassFarmerStorageLink;
  createdBy: IncomingGatePassCreatedBy;
  gatePassNo: number;
  date: string;
  type: string;
  variety: string;
  truckNumber: string;
  bagSizes: IncomingGatePassBagSize[];
  status: string;
  remarks: string;
  manualParchiNumber: string;
  rentEntryVoucherId: string;
  createdAt: string;
  updatedAt: string;
}

/** API response for GET /analytics/incoming-gate-passes */
export interface GetAllIncomingGatePassesApiResponse {
  success: boolean;
  data: {
    incomingGatePasses: IncomingGatePass[];
  };
  message: string;
}

/** Query key factory */
export const getAllIncomingGatePassesKeys = {
  all: ['analytics', 'incoming-gate-passes'] as const,
};

async function fetchAllIncomingGatePasses(): Promise<IncomingGatePass[]> {
  const { data } =
    await storeAdminAxiosClient.get<GetAllIncomingGatePassesApiResponse>(
      '/analytics/incoming-gate-passes'
    );

  if (!data.success || data.data?.incomingGatePasses == null) {
    throw new Error(data.message ?? 'Failed to fetch incoming gate passes');
  }

  return data.data.incomingGatePasses;
}

/** Query options – use with useQuery or prefetchQuery */
export const getAllIncomingGatePassesQueryOptions = () =>
  queryOptions({
    queryKey: getAllIncomingGatePassesKeys.all,
    queryFn: fetchAllIncomingGatePasses,
  });

/**
 * Hook to fetch all incoming gate passes for the authenticated cold storage.
 * Uses Bearer token from store (via axios interceptor).
 */
export function useGetAllIncomingGatePasses(options?: { enabled?: boolean }) {
  return useQuery({
    ...getAllIncomingGatePassesQueryOptions(),
    enabled: options?.enabled !== false,
  });
}

/** Prefetch incoming gate passes – e.g. before opening analytics view */
export function prefetchAllIncomingGatePasses() {
  return queryClient.prefetchQuery(getAllIncomingGatePassesQueryOptions());
}
