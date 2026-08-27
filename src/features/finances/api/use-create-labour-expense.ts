import { useMutation, useQueryClient } from '@tanstack/react-query';

import { LEDGERS_QUERY_KEY } from '@/features/finances/api/use-ledgers';
import { VOUCHERS_QUERY_KEY } from '@/features/finances/api/use-vouchers';
import type {
  CreateLabourExpensePayload,
  CreateLabourExpenseResponse,
  CreateLabourExpenseResult,
} from '@/features/finances/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

async function createLabourExpenseRequest(
  payload: CreateLabourExpensePayload,
): Promise<CreateLabourExpenseResult & { message?: string }> {
  try {
    const { data } = await apiClient.post<CreateLabourExpenseResponse>(
      '/vouchers/labour-expense',
      payload,
    );

    if (!data.success || !data.data) {
      throw new Error(data.message ?? 'Failed to create labour expense vouchers');
    }

    return { ...data.data, message: data.message };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to create labour expense vouchers'), {
      cause: error,
    });
  }
}

export function useCreateLabourExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLabourExpenseRequest,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: VOUCHERS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: LEDGERS_QUERY_KEY });
    },
  });
}
