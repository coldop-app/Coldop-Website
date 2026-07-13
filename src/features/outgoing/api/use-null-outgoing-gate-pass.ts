import { useMutation, useQueryClient } from '@tanstack/react-query';

import { DAYBOOK_QUERY_KEY } from '@/features/daybook/api/use-daybook';
import { DAYBOOK_SEARCH_QUERY_KEY } from '@/features/daybook/api/use-daybook-search';
import { INCOMING_GATE_PASSES_BY_FARMER_LINK_QUERY_KEY } from '@/features/incoming/api/use-incoming-gate-passes-by-farmer-link';
import { FARMER_GATE_PASSES_QUERY_KEY } from '@/features/people/api/use-farmer-gate-passes';
import type {
  NullOutgoingGatePassPayload,
  NullOutgoingGatePassResponse,
  OutgoingGatePassRecord,
} from '@/features/outgoing/types/api';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

type NullOutgoingGatePassInput = {
  id: string;
  payload: NullOutgoingGatePassPayload;
};

async function nullOutgoingGatePassRequest({
  id,
  payload,
}: NullOutgoingGatePassInput): Promise<OutgoingGatePassRecord> {
  try {
    const { data } = await apiClient.post<NullOutgoingGatePassResponse>(
      `/outgoing-gate-pass/${id}/null`,
      payload,
    );

    if (data.status !== 'Success' || !data.data) {
      throw new Error(data.message ?? 'Failed to null outgoing gate pass');
    }

    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to null outgoing gate pass'), {
      cause: error,
    });
  }
}

export function useNullOutgoingGatePass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: nullOutgoingGatePassRequest,
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
