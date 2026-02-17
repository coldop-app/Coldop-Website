import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { queryClient } from '@/lib/queryClient';
import storeAdminAxiosClient from '@/lib/axios';
import { vouchersKeys } from './useGetAllVouchers';

/* -------------------------------------------------
   API response & error types
------------------------------------------------- */

type DeleteVoucherSuccessResponse = {
  success: true;
  message: string;
};

type DeleteVoucherApiError = {
  success: false;
  error?: {
    code?: string;
    message?: string;
  };
};

const DEFAULT_ERROR_MESSAGE = 'Failed to delete voucher';

const STATUS_ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request. This voucher cannot be deleted.',
  401: 'Please sign in again.',
  403: 'You do not have permission to delete vouchers.',
  404: 'Voucher not found.',
  500: 'Something went wrong on the server. Please try again later.',
};

function getDeleteVoucherError(
  data: DeleteVoucherApiError | undefined,
  status?: number
): { message: string; description?: string } {
  const apiMessage = data?.error?.message;
  const fallbackMessage =
    status !== undefined && status in STATUS_ERROR_MESSAGES
      ? STATUS_ERROR_MESSAGES[status]
      : DEFAULT_ERROR_MESSAGE;
  const message =
    typeof apiMessage === 'string' && apiMessage.trim()
      ? apiMessage
      : fallbackMessage;
  const description = data?.error?.code
    ? `Code: ${data.error.code}`
    : undefined;
  return { message, description };
}

/**
 * Hook to delete a voucher.
 * DELETE /vouchers/:voucherId
 * On success invalidates vouchers list and shows toast.
 */
export function useDeleteVoucher() {
  return useMutation<
    DeleteVoucherSuccessResponse,
    AxiosError<DeleteVoucherApiError>,
    string
  >({
    mutationKey: ['vouchers', 'delete'],

    mutationFn: async (voucherId) => {
      if (!voucherId?.trim()) {
        return Promise.reject(new Error('Voucher ID is required'));
      }
      const { data } =
        await storeAdminAxiosClient.delete<DeleteVoucherSuccessResponse>(
          `/vouchers/${voucherId}`
        );
      return data;
    },

    onSuccess: (data) => {
      toast.success(data.message ?? 'Voucher deleted');
      void queryClient.invalidateQueries({ queryKey: vouchersKeys.all });
    },

    onError: (error: AxiosError<DeleteVoucherApiError> | Error) => {
      const isAxios = error instanceof AxiosError;
      const status = isAxios ? error.response?.status : undefined;
      const responseData = isAxios
        ? (error.response?.data as DeleteVoucherApiError | undefined)
        : undefined;
      const isNetworkError =
        isAxios && (error.code === 'ERR_NETWORK' || error.response == null);

      if (isNetworkError) {
        toast.error('Network error', {
          description: 'Please check your connection and try again.',
        });
        return;
      }

      if (!isAxios) {
        toast.error('Failed to delete', {
          description: error.message,
        });
        return;
      }

      const { message, description } =
        responseData !== undefined
          ? getDeleteVoucherError(responseData, status)
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
