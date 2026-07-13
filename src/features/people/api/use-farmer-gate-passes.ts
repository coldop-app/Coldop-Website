import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { DaybookEntry, DaybookPagination } from '@/features/daybook/types';
import type { DaybookSortBy, DaybookType } from '@/features/daybook/search';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export const FARMER_GATE_PASSES_QUERY_KEY = ['farmer-gate-passes'] as const;

export type FarmerGatePassSummaries = {
  totalIncomingBags: number;
  totalOutgoingBags: number;
  totalInternallyTransferredIncomingBags: number;
  totalInternallyTransferredOutgoingBags: number;
};

export type FarmerGatePassApiFilters = {
  type: DaybookType;
  sortBy: DaybookSortBy;
  from?: string;
  to?: string;
};

export type FarmerGatePassResult = {
  entries: DaybookEntry[];
  summaries: FarmerGatePassSummaries;
  emptyMessage?: string;
};

export const DEFAULT_FARMER_GATE_PASS_API_FILTERS: FarmerGatePassApiFilters = {
  type: 'all',
  sortBy: 'latest',
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

const EMPTY_SUMMARIES: FarmerGatePassSummaries = {
  totalIncomingBags: 0,
  totalOutgoingBags: 0,
  totalInternallyTransferredIncomingBags: 0,
  totalInternallyTransferredOutgoingBags: 0,
};

type FarmerGatePassesApiResponse = {
  status: 'Success' | 'Fail';
  data?: DaybookEntry[];
  message?: string;
  summaries?: FarmerGatePassSummaries;
  pagination: DaybookPagination;
};

function farmerGatePassesQueryKey(linkId: string, filters: FarmerGatePassApiFilters) {
  return [...FARMER_GATE_PASSES_QUERY_KEY, linkId, filters] as const;
}

function toFarmerGatePassListParams(filters: FarmerGatePassApiFilters) {
  return {
    type: filters.type,
    sortBy: filters.sortBy,
    ...(filters.from ? { from: filters.from } : {}),
    ...(filters.to ? { to: filters.to } : {}),
  };
}

export function paginateFarmerGatePassEntries(
  entries: DaybookEntry[],
  page: number,
  limit: number,
): { entries: DaybookEntry[]; pagination: DaybookPagination } {
  const totalItems = entries.length;
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / limit);
  const currentPage = totalPages === 0 ? 1 : Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * limit;

  return {
    entries: entries.slice(start, start + limit),
    pagination: {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
      nextPage: currentPage < totalPages ? currentPage + 1 : null,
      previousPage: currentPage > 1 ? currentPage - 1 : null,
    },
  };
}

export async function fetchFarmerGatePassesApi(
  linkId: string,
  filters: FarmerGatePassApiFilters,
): Promise<FarmerGatePassResult> {
  const { data } = await apiClient.get<FarmerGatePassesApiResponse>(
    `/farmer-storage-link/${linkId}/gate-passes`,
    { params: toFarmerGatePassListParams(filters) },
  );

  const pagination = data.pagination ?? EMPTY_PAGINATION;
  const summaries = data.summaries ?? EMPTY_SUMMARIES;

  if (data.status === 'Success' && data.data) {
    return {
      entries: data.data,
      summaries,
    };
  }

  if (data.status === 'Fail' && pagination.totalItems === 0) {
    return {
      entries: [],
      summaries,
      emptyMessage: data.message,
    };
  }

  throw new Error(data.message ?? 'Failed to load gate passes');
}

async function fetchFarmerGatePasses(
  linkId: string,
  filters: FarmerGatePassApiFilters,
): Promise<FarmerGatePassResult> {
  try {
    return await fetchFarmerGatePassesApi(linkId, filters);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load gate passes'), {
      cause: error,
    });
  }
}

export function useFarmerGatePasses(
  linkId: string,
  filters: FarmerGatePassApiFilters,
  options?: { enabled?: boolean },
) {
  const enabled = (options?.enabled ?? true) && linkId.trim().length > 0;

  const query = useQuery({
    queryKey: farmerGatePassesQueryKey(linkId, filters),
    queryFn: () => fetchFarmerGatePasses(linkId, filters),
    placeholderData: keepPreviousData,
    enabled,
  });

  return {
    entries: query.data?.entries ?? [],
    summaries: query.data?.summaries ?? EMPTY_SUMMARIES,
    emptyMessage: query.data?.emptyMessage,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
