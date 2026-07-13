import { useMutation, useQueryClient } from '@tanstack/react-query';

import { LEDGERS_QUERY_KEY } from '@/features/finances/api/use-ledgers';
import { VOUCHERS_QUERY_KEY } from '@/features/finances/api/use-vouchers';
import type {
  UpdateVoucherPayload,
  UpdateVoucherResponse,
  VoucherApiRecord,
} from '@/features/finances/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

type UpdateVoucherVariables = {
  id: string;
  payload: UpdateVoucherPayload;
};

async function updateVoucherRequest({
  id,
  payload,
}: UpdateVoucherVariables): Promise<VoucherApiRecord> {
  try {
    const { data } = await apiClient.put<UpdateVoucherResponse>(`/vouchers/${id}`, payload);

    if (!data.success || !data.data) {
      throw new Error(data.message ?? 'Failed to update voucher');
    }

    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update voucher'), {
      cause: error,
    });
  }
}

export function useUpdateVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateVoucherRequest,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: VOUCHERS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: LEDGERS_QUERY_KEY });
    },
  });
}
