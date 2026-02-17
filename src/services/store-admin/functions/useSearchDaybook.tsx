import { useMutation } from '@tanstack/react-query';
import storeAdminAxiosClient from '@/lib/axios';
import type { DaybookEntry } from './useGetDaybook';

/* -------------------------------------------------
   Search daybook by receipt number
   POST /store-admin/search-order-by-receipt
   Body: { receiptNumber: string }
------------------------------------------------- */

export interface SearchDaybookParams {
  receiptNumber: string;
}

export interface SearchDaybookApiResponse {
  status: string;
  data: {
    incoming: DaybookEntry[];
    outgoing: DaybookEntry[];
  };
}

export interface SearchDaybookResult {
  incoming: DaybookEntry[];
  outgoing: DaybookEntry[];
}

async function searchDaybookByReceipt(
  params: SearchDaybookParams
): Promise<SearchDaybookResult> {
  const { data } = await storeAdminAxiosClient.post<SearchDaybookApiResponse>(
    '/store-admin/search-order-by-receipt',
    { receiptNumber: params.receiptNumber.trim() }
  );

  if (data.status !== 'Success' || !data.data) {
    throw new Error('Failed to search daybook by receipt');
  }

  return {
    incoming: Array.isArray(data.data.incoming) ? data.data.incoming : [],
    outgoing: Array.isArray(data.data.outgoing) ? data.data.outgoing : [],
  };
}

/**
 * Mutation to search daybook by receipt number.
 * Call mutate({ receiptNumber }) to run the search.
 */
export function useSearchDaybook() {
  return useMutation({
    mutationFn: searchDaybookByReceipt,
  });
}
