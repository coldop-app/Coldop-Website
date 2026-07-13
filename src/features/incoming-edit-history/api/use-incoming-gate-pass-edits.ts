import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { IncomingEditHistorySearch } from '@/features/incoming-edit-history/search';
import { toIncomingEditHistoryParams } from '@/features/incoming-edit-history/search';
import type {
  IncomingGatePassEditHistoryApiResponse,
  IncomingGatePassEditsPagination,
  IncomingGatePassEditsResult,
} from '@/features/incoming-edit-history/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export const INCOMING_GATE_PASS_EDITS_QUERY_KEY = ['incoming-gate-pass-edits'] as const;

const EMPTY_PAGINATION: IncomingGatePassEditsPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

function incomingGatePassEditsQueryKey(filters: IncomingEditHistorySearch) {
  return [...INCOMING_GATE_PASS_EDITS_QUERY_KEY, toIncomingEditHistoryParams(filters)] as const;
}

export async function fetchIncomingGatePassEditsApi(
  filters: IncomingEditHistorySearch,
): Promise<IncomingGatePassEditsResult> {
  const { data } = await apiClient.get<IncomingGatePassEditHistoryApiResponse>(
    '/incoming-gate-pass/edit-history',
    { params: toIncomingEditHistoryParams(filters) },
  );

  if (!data.success) {
    throw new Error(data.message ?? 'Failed to load incoming edit history');
  }

  return {
    audits: data.data ?? [],
    pagination: data.pagination ?? EMPTY_PAGINATION,
  };
}

async function fetchIncomingGatePassEdits(
  filters: IncomingEditHistorySearch,
): Promise<IncomingGatePassEditsResult> {
  try {
    return await fetchIncomingGatePassEditsApi(filters);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load incoming edit history'), {
      cause: error,
    });
  }
}

export function useIncomingGatePassEdits(
  filters: IncomingEditHistorySearch,
  options?: { enabled?: boolean },
) {
  const query = useQuery({
    queryKey: incomingGatePassEditsQueryKey(filters),
    queryFn: () => fetchIncomingGatePassEdits(filters),
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  });

  return {
    audits: query.data?.audits ?? [],
    pagination: query.data?.pagination ?? EMPTY_PAGINATION,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
