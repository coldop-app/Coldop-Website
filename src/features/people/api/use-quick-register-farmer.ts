import { useMutation, useQueryClient } from '@tanstack/react-query';

import { FARMER_STORAGE_LINKS_QUERY_KEY } from '@/features/people/api/use-farmer-storage-links';
import type {
  FarmerStorageLink,
  QuickRegisterFarmerPayload,
  QuickRegisterFarmerResponse,
} from '@/features/people/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

async function quickRegisterFarmerRequest(
  payload: QuickRegisterFarmerPayload,
): Promise<{ message?: string; data: FarmerStorageLink | null }> {
  try {
    const { data } = await apiClient.post<QuickRegisterFarmerResponse>(
      '/farmer-storage-link/quick-register-farmer',
      payload,
    );

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to add farmer');
    }

    return {
      message: data.message,
      data: data.data?.farmerStorageLink ?? null,
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to add farmer'), {
      cause: error,
    });
  }
}

export function useQuickRegisterFarmer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: quickRegisterFarmerRequest,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: FARMER_STORAGE_LINKS_QUERY_KEY,
      });
    },
  });
}
