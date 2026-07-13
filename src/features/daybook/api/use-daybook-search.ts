import { isAxiosError } from 'axios';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { DaybookSearchBy } from '@/features/daybook/search';
import type { IncomingDaybookEntry, OutgoingDaybookEntry } from '@/features/daybook/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export const DAYBOOK_SEARCH_QUERY_KEY = ['daybook', 'search'] as const;

export type DaybookSearchParams = {
  receiptNumber: string;
  searchBy: DaybookSearchBy;
};

export type DaybookSearchResult = {
  incoming: IncomingDaybookEntry[];
  outgoing: OutgoingDaybookEntry[];
  emptyMessage?: string;
};

type SearchApiResponse = {
  status: 'Success';
  data: {
    incoming: IncomingDaybookEntry[];
    outgoing: OutgoingDaybookEntry[];
  };
};

function daybookSearchQueryKey(params: DaybookSearchParams) {
  return [...DAYBOOK_SEARCH_QUERY_KEY, params] as const;
}

export async function fetchDaybookSearchApi(
  params: DaybookSearchParams,
): Promise<DaybookSearchResult> {
  try {
    const { data } = await apiClient.post<SearchApiResponse>('/store-admin/search', {
      receiptNumber: params.receiptNumber,
      searchBy: params.searchBy,
    });

    return {
      incoming: data.data.incoming ?? [],
      outgoing: data.data.outgoing ?? [],
    };
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      return {
        incoming: [],
        outgoing: [],
        emptyMessage: getApiErrorMessage(error, 'No orders found with this receipt number'),
      };
    }

    throw new Error(getApiErrorMessage(error, 'Failed to search gate passes'), {
      cause: error,
    });
  }
}

export function useDaybookSearch(params: DaybookSearchParams, options?: { enabled?: boolean }) {
  const trimmedReceiptNumber = params.receiptNumber.trim();
  const queryParams = {
    receiptNumber: trimmedReceiptNumber,
    searchBy: params.searchBy,
  };

  const query = useQuery({
    queryKey: daybookSearchQueryKey(queryParams),
    queryFn: () => fetchDaybookSearchApi(queryParams),
    enabled: (options?.enabled ?? true) && trimmedReceiptNumber.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  return {
    incoming: query.data?.incoming ?? [],
    outgoing: query.data?.outgoing ?? [],
    emptyMessage: query.data?.emptyMessage,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
