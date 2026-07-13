import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { Voucher } from '@/features/finances/components/voucher-tab/types';
import type { VoucherApiRecord, VoucherFilters, VouchersResponse } from '@/features/finances/types';
import { mapVoucherToRow } from '@/features/finances/utils/map-voucher';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export const VOUCHERS_QUERY_KEY = ['vouchers'] as const;

function vouchersQueryKey(filters: VoucherFilters = {}) {
  return [...VOUCHERS_QUERY_KEY, filters] as const;
}

export async function fetchVouchersApi(filters: VoucherFilters = {}): Promise<VoucherApiRecord[]> {
  const { data } = await apiClient.get<VouchersResponse>('/vouchers', {
    params: filters,
  });

  if (!data.success || !data.data) {
    throw new Error('Failed to load vouchers');
  }

  return data.data;
}

async function fetchVouchers(filters: VoucherFilters = {}): Promise<Voucher[]> {
  try {
    const records = await fetchVouchersApi(filters);
    return records.map(mapVoucherToRow);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load vouchers'), {
      cause: error,
    });
  }
}

export function useVouchers(filters: VoucherFilters = {}) {
  const query = useQuery({
    queryKey: vouchersQueryKey(filters),
    queryFn: () => fetchVouchers(filters),
    placeholderData: keepPreviousData,
  });

  return {
    vouchers: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
