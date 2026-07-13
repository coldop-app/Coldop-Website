import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { DaybookEntry, DaybookPagination } from '@/features/daybook/types';
import { toDaybookListParams, type DaybookSearch } from '@/features/daybook/search';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export const DAYBOOK_QUERY_KEY = ['daybook'] as const;

export type DaybookFilters = DaybookSearch;

type DaybookApiResponse = {
  status: 'Success' | 'Fail';
  data?: DaybookEntry[];
  message?: string;
  pagination: DaybookPagination;
};

export type DaybookResult = {
  entries: DaybookEntry[];
  pagination: DaybookPagination;
  emptyMessage?: string;
};

const EMPTY_PAGINATION: DaybookPagination = {
  currentPage: 1,
  totalPages: 0,
  totalItems: 0,
  itemsPerPage: 10,
  hasNextPage: false,
  hasPreviousPage: false,
  nextPage: null,
  previousPage: null,
};

function daybookQueryKey(filters: DaybookFilters) {
  return [...DAYBOOK_QUERY_KEY, toDaybookListParams(filters)] as const;
}

export async function fetchDaybookApi(filters: DaybookFilters): Promise<DaybookResult> {
  const { data } = await apiClient.get<DaybookApiResponse>('/store-admin/daybook', {
    params: toDaybookListParams(filters),
  });

  const pagination = data.pagination ?? EMPTY_PAGINATION;

  if (data.status === 'Success' && data.data) {
    return {
      entries: data.data,
      pagination,
    };
  }

  if (data.status === 'Fail' && pagination.totalItems === 0) {
    return {
      entries: [],
      pagination,
      emptyMessage: data.message,
    };
  }

  throw new Error(data.message ?? 'Failed to load daybook');
}

async function fetchDaybook(filters: DaybookFilters): Promise<DaybookResult> {
  try {
    return await fetchDaybookApi(filters);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load daybook'), {
      cause: error,
    });
  }
}

export function useDaybook(filters: DaybookFilters, options?: { enabled?: boolean }) {
  const query = useQuery({
    queryKey: daybookQueryKey(filters),
    queryFn: () => fetchDaybook(filters),
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  });

  return {
    entries: query.data?.entries ?? [],
    pagination: query.data?.pagination ?? EMPTY_PAGINATION,
    emptyMessage: query.data?.emptyMessage,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
