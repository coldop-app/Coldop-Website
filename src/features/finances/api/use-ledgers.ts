import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { Ledger } from '@/features/finances/components/ledger-tab/types';
import type { LedgerApiRecord, LedgerFilters, LedgersResponse } from '@/features/finances/types';
import { mapLedgerToRow } from '@/features/finances/utils/map-ledger';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export const LEDGERS_QUERY_KEY = ['ledgers'] as const;

function ledgersQueryKey(filters: LedgerFilters = {}) {
  return [...LEDGERS_QUERY_KEY, filters] as const;
}

export async function fetchLedgersApi(filters: LedgerFilters = {}): Promise<LedgerApiRecord[]> {
  const { data } = await apiClient.get<LedgersResponse>('/ledgers', {
    params: filters,
  });

  if (!data.success || !data.data) {
    throw new Error('Failed to load ledgers');
  }

  return data.data;
}

async function fetchLedgers(filters: LedgerFilters = {}): Promise<Ledger[]> {
  try {
    const records = await fetchLedgersApi(filters);
    return records.map(mapLedgerToRow);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load ledgers'), {
      cause: error,
    });
  }
}

export function useLedgers(filters: LedgerFilters = {}) {
  const query = useQuery({
    queryKey: ledgersQueryKey(filters),
    queryFn: () => fetchLedgers(filters),
    placeholderData: keepPreviousData,
  });

  return {
    ledgers: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
