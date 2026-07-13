import { useMutation, useQueryClient } from '@tanstack/react-query';

import { LEDGERS_QUERY_KEY } from '@/features/finances/api/use-ledgers';
import { VOUCHERS_QUERY_KEY } from '@/features/finances/api/use-vouchers';
import type {
  CreateVoucherPayload,
  CreateVoucherResponse,
  VoucherApiRecord,
} from '@/features/finances/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

async function createVoucherRequest(payload: CreateVoucherPayload): Promise<VoucherApiRecord> {
  try {
    const { data } = await apiClient.post<CreateVoucherResponse>('/vouchers', payload);

    if (!data.success || !data.data) {
      throw new Error(data.message ?? 'Failed to create voucher');
    }

    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to create voucher'), {
      cause: error,
    });
  }
}

export function useCreateVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVoucherRequest,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: VOUCHERS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: LEDGERS_QUERY_KEY });
    },
  });
}
