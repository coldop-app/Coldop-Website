import { useMutation, useQueryClient } from '@tanstack/react-query';

import { LEDGERS_QUERY_KEY } from '@/features/finances/api/use-ledgers';
import type {
  LedgerApiRecord,
  UpdateLedgerPayload,
  UpdateLedgerResponse,
} from '@/features/finances/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

type UpdateLedgerVariables = {
  id: string;
  payload: UpdateLedgerPayload;
};

async function updateLedgerRequest({
  id,
  payload,
}: UpdateLedgerVariables): Promise<LedgerApiRecord> {
  try {
    const { data } = await apiClient.put<UpdateLedgerResponse>(`/ledgers/${id}`, payload);

    if (!data.success || !data.data) {
      throw new Error(data.message ?? 'Failed to update ledger');
    }

    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update ledger'), {
      cause: error,
    });
  }
}

export function useUpdateLedger() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateLedgerRequest,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LEDGERS_QUERY_KEY });
    },
  });
}
