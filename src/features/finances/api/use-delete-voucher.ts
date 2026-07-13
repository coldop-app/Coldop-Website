import { useMutation, useQueryClient } from '@tanstack/react-query';

import { LEDGERS_QUERY_KEY } from '@/features/finances/api/use-ledgers';
import { VOUCHERS_QUERY_KEY } from '@/features/finances/api/use-vouchers';
import type { DeleteVoucherResponse } from '@/features/finances/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

async function deleteVoucherRequest(id: string): Promise<void> {
  try {
    const { data } = await apiClient.delete<DeleteVoucherResponse>(`/vouchers/${id}`);

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to delete voucher');
    }
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to delete voucher'), {
      cause: error,
    });
  }
}

export function useDeleteVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVoucherRequest,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: VOUCHERS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: LEDGERS_QUERY_KEY });
    },
  });
}
