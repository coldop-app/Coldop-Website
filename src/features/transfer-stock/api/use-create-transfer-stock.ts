import { useMutation, useQueryClient } from '@tanstack/react-query';

import { DAYBOOK_QUERY_KEY } from '@/features/daybook/api/use-daybook';
import { DAYBOOK_SEARCH_QUERY_KEY } from '@/features/daybook/api/use-daybook-search';
import { INCOMING_GATE_PASSES_BY_FARMER_LINK_QUERY_KEY } from '@/features/incoming/api/use-incoming-gate-passes-by-farmer-link';
import { FARMER_GATE_PASSES_QUERY_KEY } from '@/features/people/api/use-farmer-gate-passes';
import type {
  CreateTransferStockPayload,
  CreateTransferStockResponse,
  TransferStockRecord,
} from '@/features/transfer-stock/types/api';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';
import { gatePassNumberQueryKey } from '@/lib/gate-pass-number';

async function createTransferStockRequest(
  payload: CreateTransferStockPayload,
): Promise<TransferStockRecord> {
  try {
    const { data } = await apiClient.post<CreateTransferStockResponse>('/transfer-stock', payload);

    if (data.status !== 'Success' || !data.data) {
      throw new Error(data.message ?? 'Failed to create transfer stock gate pass');
    }

    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to create transfer stock gate pass'), {
      cause: error,
    });
  }
}

export function useCreateTransferStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTransferStockRequest,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DAYBOOK_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: DAYBOOK_SEARCH_QUERY_KEY });
      void queryClient.invalidateQueries({
        queryKey: FARMER_GATE_PASSES_QUERY_KEY,
      });
      void queryClient.invalidateQueries({
        queryKey: INCOMING_GATE_PASSES_BY_FARMER_LINK_QUERY_KEY,
      });
      void queryClient.invalidateQueries({
        queryKey: gatePassNumberQueryKey('incoming'),
      });
      void queryClient.invalidateQueries({
        queryKey: gatePassNumberQueryKey('outgoing'),
      });
    },
  });
}
