import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import storeAdminAxiosClient from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';
import type {
  QuickRegisterFarmerInput,
  QuickRegisterFarmerApiResponse,
} from '@/types/farmer';
import { ledgersKeys } from '@/services/accounting/ledgers/useGetAllLedgers';
import { farmerStorageLinksKeys } from './useGetAllFarmers';

/** API error shape (400, 404, 409): { success, error: { code, message } } */
type QuickAddFarmerApiError = {
  success?: boolean;
  message?: string;
  error?: { code?: string; message?: string };
};

const DEFAULT_ERROR_MESSAGE = 'Failed to register farmer';

const STATUS_ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input.',
  404: 'Cold storage or store admin not found.',
  409: 'Farmer or link already exists.',
};

function getQuickAddFarmerError(
  data: QuickAddFarmerApiError | undefined,
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
 * Hook to quick-register a farmer and create a farmer–storage link in one call.
 * POST /store-admin/quick-register-farmer
 * Request: name, address, mobileNumber, imageUrl?, coldStorageId, linkedById,
 *          accountNumber, costPerBag, openingBalance
 * On success invalidates farmer-storage-links. Errors shown via sonner toast.
 */
export function useQuickAddFarmer() {
  return useMutation<
    QuickRegisterFarmerApiResponse,
    AxiosError<QuickAddFarmerApiError>,
    QuickRegisterFarmerInput
  >({
    mutationKey: ['store-admin', 'quick-register-farmer'],

    mutationFn: async (payload) => {
      const { data } =
        await storeAdminAxiosClient.post<QuickRegisterFarmerApiResponse>(
          '/store-admin/quick-register-farmer',
          payload
        );
      return data;
    },

    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message ?? 'Farmer registered successfully', {
          description: data.data?.farmer?.name
            ? `Account for ${data.data.farmer.name} created`
            : undefined,
        });
        void queryClient.refetchQueries({ queryKey: farmerStorageLinksKeys.all });
        queryClient.invalidateQueries({ queryKey: ledgersKeys.all });
      } else {
        toast.error(DEFAULT_ERROR_MESSAGE, {
          description: data.message ?? undefined,
        });
      }
    },

    onError: (error: AxiosError<QuickAddFarmerApiError>) => {
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
          ? getQuickAddFarmerError(
              responseData as QuickAddFarmerApiError,
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
