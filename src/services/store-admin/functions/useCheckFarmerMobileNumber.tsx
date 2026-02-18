import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import storeAdminAxiosClient from '@/lib/axios';
import type {
  CheckFarmerMobileInput,
  CheckFarmerMobileApiResponse,
} from '@/types/farmer';

/** API error shape (400): { success, error: { code, message } } */
type CheckFarmerMobileApiError = {
  success?: boolean;
  message?: string;
  error?: { code?: string; message?: string };
};

const DEFAULT_ERROR_MESSAGE = 'Failed to check mobile number';

const STATUS_ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid mobile number. Use a 10-digit Indian number starting with 6–9.',
};

function getCheckFarmerMobileError(
  data: CheckFarmerMobileApiError | undefined,
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
 * Hook to check if a farmer already exists with the given mobile number.
 * POST /farmer-storage-link/check
 * Body: { mobileNumber } (10-digit Indian mobile, 6–9 start).
 * Returns { success, message, data?: { farmer? } } — farmer present if number is taken.
 * Errors shown via sonner toast.
 */
export function useCheckFarmerMobileNumber() {
  return useMutation<
    CheckFarmerMobileApiResponse,
    AxiosError<CheckFarmerMobileApiError>,
    CheckFarmerMobileInput
  >({
    mutationKey: ['store-admin', 'check-farmer-mobile'],

    mutationFn: async (payload) => {
      const { data } =
        await storeAdminAxiosClient.post<CheckFarmerMobileApiResponse>(
          '/farmer-storage-link/check',
          payload
        );
      return data;
    },

    onError: (error: AxiosError<CheckFarmerMobileApiError>) => {
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
          ? getCheckFarmerMobileError(
              responseData as CheckFarmerMobileApiError,
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
