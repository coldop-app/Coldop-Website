import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import storeAdminAxiosClient from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';
import type {
  UpdateFarmerStorageLinkInput,
  UpdateFarmerStorageLinkApiResponse,
} from '@/types/farmer';
import { farmerStorageLinksKeys } from './useGetAllFarmers';

/** Variables for the update mutation: id + body fields */
export type UpdateFarmerStorageLinkVariables = {
  farmerStorageLinkId: string;
} & UpdateFarmerStorageLinkInput;

/** API error shape (400, 404, 409): { success, error: { code, message } } */
type UpdateFarmerStorageLinkApiError = {
  success?: boolean;
  message?: string;
  error?: { code?: string; message?: string };
};

const DEFAULT_ERROR_MESSAGE = 'Failed to update farmer';

const STATUS_ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input.',
  404: 'Farmer-storage-link not found.',
  409: 'Conflict. Resource may already exist or duplicate data.',
};

function getUpdateFarmerError(
  data: UpdateFarmerStorageLinkApiError | undefined,
  status?: number
): { message: string; description?: string } {
  const apiMessage = data?.error?.message ?? data?.message;
  const fallbackMessage =
    status !== undefined && status in STATUS_ERROR_MESSAGES
      ? STATUS_ERROR_MESSAGES[status]
      : DEFAULT_ERROR_MESSAGE;
  const message = apiMessage ?? fallbackMessage;
  const description = data?.error?.code
    ? `Code: ${data.error.code}`
    : undefined;
  return { message, description };
}

/**
 * Hook to update a farmer-storage-link and associated farmer.
 * PUT /store-admin/farmer-storage-link/:id
 * Request body: name?, address?, mobileNumber?, imageUrl?, accountNumber?,
 *              isActive?, notes?, linkedById?, openingBalance?, costPerBag?
 * On success invalidates farmer-storage-links. Errors shown via sonner toast.
 */
export function useUpdateFarmer() {
  return useMutation<
    UpdateFarmerStorageLinkApiResponse,
    AxiosError<UpdateFarmerStorageLinkApiError>,
    UpdateFarmerStorageLinkVariables
  >({
    mutationKey: ['store-admin', 'update-farmer-storage-link'],

    mutationFn: async ({ farmerStorageLinkId, ...body }) => {
      const { data } =
        await storeAdminAxiosClient.put<UpdateFarmerStorageLinkApiResponse>(
          `/store-admin/farmer-storage-link/${farmerStorageLinkId}`,
          body
        );
      return data;
    },

    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message ?? 'Farmer updated successfully', {
          description: data.data?.farmer?.name
            ? `${data.data.farmer.name} updated`
            : undefined,
        });
        void queryClient.refetchQueries({ queryKey: farmerStorageLinksKeys.all });
      } else {
        toast.error(DEFAULT_ERROR_MESSAGE, {
          description: data.message ?? undefined,
        });
      }
    },

    onError: (error: AxiosError<UpdateFarmerStorageLinkApiError>) => {
      const status = error.response?.status;
      const responseData = error.response?.data;
      const isNetworkError = error.code === 'ERR_NETWORK' || !error.response;

      if (isNetworkError) {
        toast.error('Network error', {
          description: 'Please check your connection and try again.',
        });
        return;
      }

      const { message, description } =
        responseData !== undefined
          ? getUpdateFarmerError(
              responseData as UpdateFarmerStorageLinkApiError,
              status
            )
          : {
              message:
                status !== undefined && status in STATUS_ERROR_MESSAGES
                  ? STATUS_ERROR_MESSAGES[status]
                  : error.message || DEFAULT_ERROR_MESSAGE,
              description: undefined,
            };

      toast.error(message, { description });
    },
  });
}
