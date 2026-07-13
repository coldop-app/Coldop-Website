import { useMutation, useQueryClient } from '@tanstack/react-query';

import { LEDGERS_QUERY_KEY } from '@/features/finances/api/use-ledgers';
import type { DeleteLedgerResponse } from '@/features/finances/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

async function deleteLedgerRequest(id: string): Promise<void> {
  try {
    const { data } = await apiClient.delete<DeleteLedgerResponse>(`/ledgers/${id}`);

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to delete ledger');
    }
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to delete ledger'), {
      cause: error,
    });
  }
}

export function useDeleteLedger() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLedgerRequest,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LEDGERS_QUERY_KEY });
    },
  });
}
