import { useMutation, useQueryClient } from '@tanstack/react-query';

import { DAYBOOK_QUERY_KEY } from '@/features/daybook/api/use-daybook';
import { DAYBOOK_SEARCH_QUERY_KEY } from '@/features/daybook/api/use-daybook-search';
import { INCOMING_GATE_PASSES_BY_FARMER_LINK_QUERY_KEY } from '@/features/incoming/api/use-incoming-gate-passes-by-farmer-link';
import { FARMER_GATE_PASSES_QUERY_KEY } from '@/features/people/api/use-farmer-gate-passes';
import type {
  OutgoingGatePassRecord,
  UpdateOutgoingGatePassPayload,
  UpdateOutgoingGatePassResponse,
} from '@/features/outgoing/types/api';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

type UpdateOutgoingGatePassInput = {
  id: string;
  payload: UpdateOutgoingGatePassPayload;
};

export async function updateOutgoingGatePassRequest({
  id,
  payload,
}: UpdateOutgoingGatePassInput): Promise<OutgoingGatePassRecord> {
  try {
    const { data } = await apiClient.patch<UpdateOutgoingGatePassResponse>(
      `/outgoing-gate-pass/${id}`,
      payload,
    );

    if (data.status !== 'Success' || !data.data) {
      throw new Error(data.message ?? 'Failed to update outgoing gate pass');
    }

    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update outgoing gate pass'), {
      cause: error,
    });
  }
}

export function useUpdateOutgoingGatePass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateOutgoingGatePassRequest,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DAYBOOK_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: DAYBOOK_SEARCH_QUERY_KEY });
      void queryClient.invalidateQueries({
        queryKey: FARMER_GATE_PASSES_QUERY_KEY,
      });
      void queryClient.invalidateQueries({
        queryKey: INCOMING_GATE_PASSES_BY_FARMER_LINK_QUERY_KEY,
      });
    },
  });
}
