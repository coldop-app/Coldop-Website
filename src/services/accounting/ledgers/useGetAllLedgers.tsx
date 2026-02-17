import { useQuery, queryOptions } from '@tanstack/react-query';
import storeAdminAxiosClient from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';

/** Ledger type from GET /ledgers */
export interface Ledger {
  _id: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Income' | 'Expense' | 'Equity';
  subType: string;
  category: string;
  openingBalance: number;
  balance: number;
  closingBalance: number | null;
  coldStorageId: string;
  farmerStorageLinkId: string | null;
  createdBy: string;
  isSystemLedger: boolean;
  createdAt: string;
  updatedAt: string;
  transactionCount: number;
}

/** API response shape for GET /ledgers */
export interface GetAllLedgersApiResponse {
  success: boolean;
  data: Ledger[];
}

/** Query params for ledgers list (matches backend schema) */
export interface GetAllLedgersParams {
  type?: Ledger['type'];
  search?: string;
  farmerStorageLinkId?: string | null;
  from?: string; // date-time
  to?: string; // date-time
}

/** Query key factory */
export const ledgersKeys = {
  all: ['ledgers'] as const,
  lists: () => [...ledgersKeys.all, 'list'] as const,
  list: (params?: GetAllLedgersParams) =>
    [...ledgersKeys.lists(), params ?? {}] as const,
};

/** Fetcher used by queryOptions and prefetch */
async function fetchAllLedgers(
  params: GetAllLedgersParams = {}
): Promise<Ledger[]> {
  const searchParams: Record<string, string> = {};

  if (params.type != null) searchParams.type = params.type;
  if (params.search != null && params.search !== '')
    searchParams.search = params.search;
  if (params.farmerStorageLinkId != null && params.farmerStorageLinkId !== '')
    searchParams.farmerStorageLinkId = params.farmerStorageLinkId;
  if (params.from != null) searchParams.from = params.from;
  if (params.to != null) searchParams.to = params.to;

  const { data } = await storeAdminAxiosClient.get<GetAllLedgersApiResponse>(
    '/ledgers',
    { params: searchParams }
  );

  if (!data.success || !Array.isArray(data.data)) {
    throw new Error('Failed to fetch ledgers');
  }

  return data.data;
}

/** Query options – use with useQuery, prefetchQuery, or in loaders */
export const allLedgersQueryOptions = (params: GetAllLedgersParams = {}) =>
  queryOptions({
    queryKey: ledgersKeys.list(params),
    queryFn: () => fetchAllLedgers(params),
  });

/** Hook to fetch all ledgers for the current cold storage (optional filters). */
export function useGetAllLedgers(params: GetAllLedgersParams = {}) {
  return useQuery(allLedgersQueryOptions(params));
}

/** Prefetch ledgers – e.g. before navigating to my-finances */
export function prefetchAllLedgers(params: GetAllLedgersParams = {}) {
  return queryClient.prefetchQuery(allLedgersQueryOptions(params));
}
