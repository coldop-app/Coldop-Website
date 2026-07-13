import { useMutation, useQueryClient } from '@tanstack/react-query';

import { LEDGERS_QUERY_KEY } from '@/features/finances/api/use-ledgers';
import type {
  CreateLedgerPayload,
  CreateLedgerResponse,
  LedgerApiRecord,
} from '@/features/finances/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

async function createLedgerRequest(payload: CreateLedgerPayload): Promise<LedgerApiRecord> {
  try {
    const { data } = await apiClient.post<CreateLedgerResponse>('/ledgers', payload);

    if (!data.success || !data.data) {
      throw new Error(data.message ?? 'Failed to create ledger');
    }

    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to create ledger'), {
      cause: error,
    });
  }
}

export function useCreateLedger() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLedgerRequest,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LEDGERS_QUERY_KEY });
    },
  });
}
