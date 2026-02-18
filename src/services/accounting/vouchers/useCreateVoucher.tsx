import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import * as z from 'zod';
import { queryClient } from '@/lib/queryClient';
import storeAdminAxiosClient from '@/lib/axios';
import { ledgersKeys } from '../ledgers/useGetAllLedgers';
import { vouchersKeys } from './useGetAllVouchers';

/* -------------------------------------------------
   API request body schema (matches backend)
------------------------------------------------- */

export const createVoucherBodySchema = z.object({
  date: z.string().min(1, 'Date is required'),
  debitLedger: z.string().min(1, 'Debit ledger is required'),
  creditLedger: z.string().min(1, 'Credit ledger is required'),
  amount: z.number().positive('Amount must be greater than 0'),
  narration: z.string().optional(),
  farmerStorageLinkId: z.string().nullable().optional(),
});

export type CreateVoucherBody = z.infer<typeof createVoucherBodySchema>;

/* -------------------------------------------------
   API response & error types
------------------------------------------------- */

type VoucherLedgerRef = {
  _id: string;
  name: string;
};

type CreateVoucherData = {
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
};

type CreateVoucherSuccessResponse = {
  success: true;
  data: CreateVoucherData;
  message: string;
};

type CreateVoucherApiError = {
  success: false;
  error?: {
    code?: string;
    message?: string;
  };
};

const DEFAULT_ERROR_MESSAGE = 'Failed to create voucher';

const STATUS_ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input.',
  401: 'Please sign in again.',
  403: 'You do not have permission to create vouchers.',
  409: 'A voucher with these details already exists, or the operation conflicts with existing data.',
  500: 'Something went wrong on the server. Please try again later.',
};

function getCreateVoucherError(
  data: CreateVoucherApiError | undefined,
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
 * Hook to create a voucher.
 * POST /vouchers
 * Validates payload with Zod. On success invalidates vouchers list and shows toast.
 */
export function useCreateVoucher() {
  return useMutation<
    CreateVoucherSuccessResponse,
    AxiosError<CreateVoucherApiError>,
    CreateVoucherBody
  >({
    mutationKey: ['vouchers', 'create'],

    mutationFn: async (payload) => {
      const parsed = createVoucherBodySchema.safeParse(payload);
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
        await storeAdminAxiosClient.post<CreateVoucherSuccessResponse>(
          '/vouchers',
          parsed.data
        );
      return data;
    },

    onSuccess: (data) => {
      toast.success(data.message ?? 'Voucher created', {
        description:
          data.data?.voucherNumber != null
            ? `Voucher #${data.data.voucherNumber} has been created`
            : undefined,
      });
      void queryClient.invalidateQueries({ queryKey: vouchersKeys.all });
      void queryClient.invalidateQueries({ queryKey: ledgersKeys.all });
    },

    onError: (error: AxiosError<CreateVoucherApiError> | Error) => {
      const isAxios = error instanceof AxiosError;
      const status = isAxios ? error.response?.status : undefined;
      const responseData = isAxios
        ? (error.response?.data as CreateVoucherApiError | undefined)
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
          ? getCreateVoucherError(responseData, status)
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
