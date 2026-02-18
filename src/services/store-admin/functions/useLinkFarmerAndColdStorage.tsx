import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import storeAdminAxiosClient from '@/lib/axios';
import type {
  LinkFarmerToStoreInput,
  LinkFarmerToStoreApiResponse,
} from '@/types/farmer';

/** API error shape (400/401/404/409): { success, error: { code, message } } */
type LinkFarmerToStoreApiError = {
  success?: boolean;
  message?: string;
  error?: { code?: string; message?: string };
};

const DEFAULT_ERROR_MESSAGE = 'Failed to link farmer to store';

const STATUS_ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Check farmer ID, account number, and cost per bag.',
  401: 'Please sign in again to link a farmer.',
  404: 'Farmer, cold storage, or store admin not found.',
  409: 'This farmer is already linked or the account number is already in use.',
};

function getLinkFarmerToStoreError(
  data: LinkFarmerToStoreApiError | undefined,
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
 * Hook to link an existing farmer to the current cold storage.
 * POST /farmer-storage-link/link-farmer-to-store
 * Body: { farmerId, accountNumber, costPerBag, openingBalance? }
 * Returns { success, message, data: { farmer, farmerStorageLink } } on 200.
 * Errors (400, 401, 404, 409) shown via sonner toast.
 */
export function useLinkFarmerAndColdStorage() {
  return useMutation<
    LinkFarmerToStoreApiResponse,
    AxiosError<LinkFarmerToStoreApiError>,
    LinkFarmerToStoreInput
  >({
    mutationKey: ['store-admin', 'link-farmer-to-store'],

    mutationFn: async (payload) => {
      const { data } =
        await storeAdminAxiosClient.post<LinkFarmerToStoreApiResponse>(
          '/farmer-storage-link/link-farmer-to-store',
          payload
        );
      return data;
    },

    onError: (error: AxiosError<LinkFarmerToStoreApiError>) => {
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
          ? getLinkFarmerToStoreError(
              responseData as LinkFarmerToStoreApiError,
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
