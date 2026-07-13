import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { OutgoingEditHistorySearch } from '@/features/outgoing-edit-history/search';
import { toOutgoingEditHistoryParams } from '@/features/outgoing-edit-history/search';
import type {
  OutgoingGatePassEditHistoryApiResponse,
  OutgoingGatePassEditsPagination,
  OutgoingGatePassEditsResult,
} from '@/features/outgoing-edit-history/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export const OUTGOING_GATE_PASS_EDITS_QUERY_KEY = ['outgoing-gate-pass-edits'] as const;

const EMPTY_PAGINATION: OutgoingGatePassEditsPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

type RawOutgoingEditsPagination = Partial<OutgoingGatePassEditsPagination> & {
  currentPage?: number;
  totalItems?: number;
  itemsPerPage?: number;
};

function normalizeOutgoingEditsPagination(
  raw: RawOutgoingEditsPagination | undefined,
  filters: OutgoingEditHistorySearch,
): OutgoingGatePassEditsPagination {
  if (!raw) {
    return {
      ...EMPTY_PAGINATION,
      page: filters.page,
      limit: filters.limit,
    };
  }

  const page = raw.page ?? raw.currentPage ?? filters.page;
  const limit = raw.limit ?? raw.itemsPerPage ?? filters.limit;
  const total = raw.total ?? raw.totalItems ?? 0;
  const totalPages = raw.totalPages ?? (total === 0 ? 0 : Math.max(1, Math.ceil(total / limit)));

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: raw.hasNextPage ?? page < totalPages,
    hasPreviousPage: raw.hasPreviousPage ?? page > 1,
  };
}

function outgoingGatePassEditsQueryKey(filters: OutgoingEditHistorySearch) {
  return [...OUTGOING_GATE_PASS_EDITS_QUERY_KEY, toOutgoingEditHistoryParams(filters)] as const;
}

export async function fetchOutgoingGatePassEditsApi(
  filters: OutgoingEditHistorySearch,
): Promise<OutgoingGatePassEditsResult> {
  const { data } = await apiClient.get<OutgoingGatePassEditHistoryApiResponse>(
    '/outgoing-gate-pass/edit-history',
    { params: toOutgoingEditHistoryParams(filters) },
  );

  if (!data.success) {
    throw new Error(data.message ?? 'Failed to load outgoing edit history');
  }

  return {
    audits: data.data ?? [],
    pagination: normalizeOutgoingEditsPagination(data.pagination, filters),
  };
}

async function fetchOutgoingGatePassEdits(
  filters: OutgoingEditHistorySearch,
): Promise<OutgoingGatePassEditsResult> {
  try {
    return await fetchOutgoingGatePassEditsApi(filters);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load outgoing edit history'), {
      cause: error,
    });
  }
}

export function useOutgoingGatePassEdits(
  filters: OutgoingEditHistorySearch,
  options?: { enabled?: boolean },
) {
  const query = useQuery({
    queryKey: outgoingGatePassEditsQueryKey(filters),
    queryFn: () => fetchOutgoingGatePassEdits(filters),
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
