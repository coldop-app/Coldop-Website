import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import * as z from 'zod';
import { queryClient } from '@/lib/queryClient';
import storeAdminAxiosClient from '@/lib/axios';
import { vouchersKeys } from './useGetAllVouchers';

/* -------------------------------------------------
   API request body schema (matches backend - partial update)
------------------------------------------------- */

export const updateVoucherBodySchema = z.object({
  amount: z.number().positive('Amount must be greater than 0').optional(),
  narration: z.string().optional(),
});

export type UpdateVoucherBody = z.infer<typeof updateVoucherBodySchema>;

/** Full payload: voucher id + body (used as mutation variables) */
export type UpdateVoucherPayload = UpdateVoucherBody & { voucherId: string };

/* -------------------------------------------------
   API response & error types
------------------------------------------------- */

type VoucherLedgerRef = {
  _id: string;
  name: string;
};

type UpdateVoucherData = {
  _id: string;
  type: string;
  voucherNumber: number;
  date: string;
  debitLedger: VoucherLedgerRef;
  creditLedger: VoucherLedgerRef;
  amount: number;
  narration: string | null;
  coldStorageId: string;
  farmerStorageLinkId: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
};

type UpdateVoucherSuccessResponse = {
  success: true;
  data: UpdateVoucherData;
  message: string;
};

type UpdateVoucherApiError = {
  success: false;
  error?: {
    code?: string;
    message?: string;
  };
};

const DEFAULT_ERROR_MESSAGE = 'Failed to update voucher';

const STATUS_ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input.',
  401: 'Please sign in again.',
  403: 'You do not have permission to update vouchers.',
  404: 'Voucher not found.',
  409: 'This voucher cannot be updated (it may conflict with existing data).',
  500: 'Something went wrong on the server. Please try again later.',
};

function getUpdateVoucherError(
  data: UpdateVoucherApiError | undefined,
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
 * Hook to update a voucher.
 * PUT /vouchers/:voucherId
 * Validates payload with Zod. On success invalidates vouchers list and shows toast.
 */
export function useUpdateVoucher() {
  return useMutation<
    UpdateVoucherSuccessResponse,
    AxiosError<UpdateVoucherApiError>,
    UpdateVoucherPayload
  >({
    mutationKey: ['vouchers', 'update'],

    mutationFn: async (payload) => {
      const { voucherId, ...body } = payload;
      const parsed = updateVoucherBodySchema.safeParse(body);
      if (!parsed.success) {
        const first = parsed.error.flatten().fieldErrors;
        const msg =
          typeof first === 'object' &&
          first !== null &&
          Object.keys(first).length
            ? (Object.values(first).flat().filter(Boolean)[0] as string)
            : parsed.error.message;
        return Promise.reject(new Error(msg ?? 'Validation failed'));
      }

      const { data } =
        await storeAdminAxiosClient.put<UpdateVoucherSuccessResponse>(
          `/vouchers/${voucherId}`,
          parsed.data
        );
      return data;
    },

    onSuccess: (data) => {
      toast.success(data.message ?? 'Voucher updated', {
        description:
          data.data?.voucherNumber != null
            ? `Voucher #${data.data.voucherNumber} has been updated`
            : undefined,
      });
      void queryClient.invalidateQueries({ queryKey: vouchersKeys.all });
    },

    onError: (error: AxiosError<UpdateVoucherApiError> | Error) => {
      const isAxios = error instanceof AxiosError;
      const status = isAxios ? error.response?.status : undefined;
      const responseData = isAxios
        ? (error.response?.data as UpdateVoucherApiError | undefined)
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
        toast.error('Validation failed', {
          description: error.message,
        });
        return;
      }

      const { message, description } =
        responseData !== undefined
          ? getUpdateVoucherError(responseData, status)
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
