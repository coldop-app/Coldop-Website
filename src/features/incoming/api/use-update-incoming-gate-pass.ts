import { useMutation, useQueryClient } from '@tanstack/react-query';

import { DAYBOOK_QUERY_KEY } from '@/features/daybook/api/use-daybook';
import { DAYBOOK_SEARCH_QUERY_KEY } from '@/features/daybook/api/use-daybook-search';
import { FARMER_GATE_PASSES_QUERY_KEY } from '@/features/people/api/use-farmer-gate-passes';
import type {
  IncomingGatePassRecord,
  UpdateIncomingGatePassPayload,
  UpdateIncomingGatePassResponse,
} from '@/features/incoming/types/api';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

type UpdateIncomingGatePassInput = {
  id: string;
  payload: UpdateIncomingGatePassPayload;
};

async function updateIncomingGatePassRequest({
  id,
  payload,
}: UpdateIncomingGatePassInput): Promise<IncomingGatePassRecord> {
  try {
    const { data } = await apiClient.patch<UpdateIncomingGatePassResponse>(
      `/incoming-gate-pass/${id}`,
      payload,
    );

    if (!data.success || !data.data) {
      throw new Error(data.message ?? 'Failed to update incoming gate pass');
    }

    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update incoming gate pass'), {
      cause: error,
    });
  }
}

export function useUpdateIncomingGatePass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateIncomingGatePassRequest,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DAYBOOK_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: DAYBOOK_SEARCH_QUERY_KEY });
      void queryClient.invalidateQueries({
        queryKey: FARMER_GATE_PASSES_QUERY_KEY,
      });
    },
  });
}
