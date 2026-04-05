import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import storeAdminAxiosClient from '@/lib/axios';
import type { DaybookEntry } from './useGetDaybook';

/* -------------------------------------------------
   Search order by receipt
   POST /api/v1/store-admin/search-order-by-receipt
------------------------------------------------- */

export type SearchOrderByReceiptSearchBy =
  | 'gatePassNumber'
  | 'manualParchiNumber'
  | 'marka'
  | 'customMarka'
  | 'remarks';

export interface SearchOrderByReceiptRequest {
  receiptNumber: string;
  searchBy?: SearchOrderByReceiptSearchBy;
}

/** Params for the daybook search mutation (same shape as the API body). */
export type SearchDaybookParams = SearchOrderByReceiptRequest;

export interface SearchDaybookApiSuccess {
  status: 'Success';
  data: {
    incoming: DaybookEntry[];
    outgoing: DaybookEntry[];
  };
}

export interface SearchDaybookApiFail {
  status: 'Fail';
  message: string;
}

export type SearchDaybookApiResponse = SearchDaybookApiSuccess | SearchDaybookApiFail;

export interface SearchDaybookResult {
  incoming: DaybookEntry[];
  outgoing: DaybookEntry[];
}

function buildSearchOrderByReceiptBody(
  params: SearchDaybookParams
): Record<string, string> {
  const body: Record<string, string> = {
    receiptNumber: params.receiptNumber.trim(),
  };
  if (
    params.searchBy &&
    params.searchBy !== 'gatePassNumber'
  ) {
    body.searchBy = params.searchBy;
  }
  return body;
}

async function searchDaybookByReceipt(
  params: SearchDaybookParams
): Promise<SearchDaybookResult> {
  try {
    const { data } = await storeAdminAxiosClient.post<SearchDaybookApiResponse>(
      '/store-admin/search-order-by-receipt',
      buildSearchOrderByReceiptBody(params)
    );

    if (data.status === 'Success' && data.data) {
      return {
        incoming: Array.isArray(data.data.incoming) ? data.data.incoming : [],
        outgoing: Array.isArray(data.data.outgoing) ? data.data.outgoing : [],
      };
    }

    if (data.status === 'Fail' && 'message' in data) {
      throw new Error(data.message);
    }

    throw new Error('Search failed');
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      const status = err.response.status;
      const payload = err.response.data as SearchDaybookApiFail | undefined;
      if (
        (status === 404 || status === 400) &&
        payload?.status === 'Fail' &&
        typeof payload.message === 'string'
      ) {
        throw new Error(payload.message, { cause: err });
      }
    }
    throw err;
  }
}

/**
 * Mutation to search daybook / orders by receipt.
 * Call mutate({ receiptNumber, searchBy? }) — omit searchBy or use gatePassNumber for the default gate-pass search.
 */
export function useSearchDaybook() {
  return useMutation({
    mutationFn: searchDaybookByReceipt,
  });
}
