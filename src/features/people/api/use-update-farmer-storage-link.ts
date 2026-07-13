import { useMutation, useQueryClient } from '@tanstack/react-query';

import { FARMER_STORAGE_LINKS_QUERY_KEY } from '@/features/people/api/use-farmer-storage-links';
import type {
  FarmerStorageLink,
  UpdateFarmerStorageLinkPayload,
  UpdateFarmerStorageLinkResponse,
} from '@/features/people/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

type UpdateFarmerStorageLinkVariables = {
  id: string;
  payload: UpdateFarmerStorageLinkPayload;
};

async function updateFarmerStorageLinkRequest({
  id,
  payload,
}: UpdateFarmerStorageLinkVariables): Promise<{
  message?: string;
  data: FarmerStorageLink | null;
}> {
  try {
    const { data } = await apiClient.put<UpdateFarmerStorageLinkResponse>(
      `/farmer-storage-link/${id}`,
      payload,
    );

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to update farmer');
    }

    return {
      message: data.message,
      data: data.data?.farmerStorageLink ?? null,
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update farmer'), {
      cause: error,
    });
  }
}

export function useUpdateFarmerStorageLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateFarmerStorageLinkRequest,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: FARMER_STORAGE_LINKS_QUERY_KEY,
      });
    },
  });
}
