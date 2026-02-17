import { useQuery, queryOptions } from '@tanstack/react-query';
import storeAdminAxiosClient from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';

/** Ledger reference as returned in voucher list */
export interface VoucherLedgerRef {
  _id: string;
  name: string;
}

/** Voucher type from GET /vouchers */
export interface Voucher {
  _id: string;
  type: string;
  voucherNumber: number;
  date: string;
  debitLedger: VoucherLedgerRef;
  creditLedger: VoucherLedgerRef;
  amount: number;
  narration: string | null;
  coldStorageId: string;
  farmerStorageLinkId: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/** API response shape for GET /vouchers */
export interface GetAllVouchersApiResponse {
  success: boolean;
  data: Voucher[];
}

/** Query params for vouchers list (optional, for future backend support) */
export interface GetAllVouchersParams {
  from?: string;
  to?: string;
  farmerStorageLinkId?: string | null;
}

/** Query key factory */
export const vouchersKeys = {
  all: ['vouchers'] as const,
  lists: () => [...vouchersKeys.all, 'list'] as const,
  list: (params?: GetAllVouchersParams) =>
    [...vouchersKeys.lists(), params ?? {}] as const,
};

/** Fetcher used by queryOptions and prefetch */
async function fetchAllVouchers(
  params: GetAllVouchersParams = {}
): Promise<Voucher[]> {
  const searchParams: Record<string, string> = {};
  if (params.from != null) searchParams.from = params.from;
  if (params.to != null) searchParams.to = params.to;
  if (params.farmerStorageLinkId != null && params.farmerStorageLinkId !== '')
    searchParams.farmerStorageLinkId = params.farmerStorageLinkId;

  const { data } = await storeAdminAxiosClient.get<GetAllVouchersApiResponse>(
    '/vouchers',
    { params: Object.keys(searchParams).length ? searchParams : undefined }
  );

  if (!data.success || !Array.isArray(data.data)) {
    throw new Error('Failed to fetch vouchers');
  }

  return data.data;
}

/** Query options – use with useQuery, prefetchQuery, or in loaders */
export const allVouchersQueryOptions = (params: GetAllVouchersParams = {}) =>
  queryOptions({
    queryKey: vouchersKeys.list(params),
    queryFn: () => fetchAllVouchers(params),
  });

/** Hook to fetch all vouchers for the current cold storage (optional filters). */
export function useGetAllVouchers(params: GetAllVouchersParams = {}) {
  return useQuery(allVouchersQueryOptions(params));
}

/** Prefetch vouchers – e.g. before navigating to my-finances */
export function prefetchAllVouchers(params: GetAllVouchersParams = {}) {
  return queryClient.prefetchQuery(allVouchersQueryOptions(params));
}
