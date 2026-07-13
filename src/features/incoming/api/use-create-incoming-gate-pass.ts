import { useMutation, useQueryClient } from '@tanstack/react-query';

import { DAYBOOK_QUERY_KEY } from '@/features/daybook/api/use-daybook';
import { DAYBOOK_SEARCH_QUERY_KEY } from '@/features/daybook/api/use-daybook-search';
import { FARMER_GATE_PASSES_QUERY_KEY } from '@/features/people/api/use-farmer-gate-passes';
import type {
  CreateIncomingGatePassPayload,
  CreateIncomingGatePassResponse,
  IncomingGatePassRecord,
} from '@/features/incoming/types/api';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';
import { gatePassNumberQueryKey } from '@/lib/gate-pass-number';

async function createIncomingGatePassRequest(
  payload: CreateIncomingGatePassPayload,
): Promise<IncomingGatePassRecord> {
  try {
    const { data } = await apiClient.post<CreateIncomingGatePassResponse>(
      '/incoming-gate-pass/',
      payload,
    );

    if (!data.success || !data.data) {
      throw new Error(data.message ?? 'Failed to create incoming gate pass');
    }

    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to create incoming gate pass'), {
      cause: error,
    });
  }
}

export function useCreateIncomingGatePass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createIncomingGatePassRequest,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DAYBOOK_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: DAYBOOK_SEARCH_QUERY_KEY });
      void queryClient.invalidateQueries({
        queryKey: FARMER_GATE_PASSES_QUERY_KEY,
      });
      void queryClient.invalidateQueries({
        queryKey: gatePassNumberQueryKey('incoming'),
      });
    },
  });
}
