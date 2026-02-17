import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import * as z from 'zod';
import { queryClient } from '@/lib/queryClient';
import storeAdminAxiosClient from '@/lib/axios';
import { ledgersKeys } from './useGetAllLedgers';

/* -------------------------------------------------
   API request body schema (matches backend)
------------------------------------------------- */

const ledgerTypeEnum = z.enum([
  'Asset',
  'Liability',
  'Income',
  'Expense',
  'Equity',
]);

export const createLedgerBodySchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  type: ledgerTypeEnum,
  subType: z.string().min(1, 'Sub type is required').trim(),
  category: z.string().min(1, 'Category is required').trim(),
  openingBalance: z.number().optional(),
});

export type CreateLedgerBody = z.infer<typeof createLedgerBodySchema>;

/* -------------------------------------------------
   API response & error types
------------------------------------------------- */

/** Ledger shape returned by POST /ledgers (no transactionCount) */
type CreateLedgerData = {
  _id: string;
  name: string;
  type: string;
  subType: string;
  category: string;
  openingBalance: number;
  balance: number;
  closingBalance: number | null;
  coldStorageId: string;
  farmerStorageLinkId: string | null;
  createdBy: string;
  isSystemLedger: boolean;
  createdAt: string;
  updatedAt: string;
};

type CreateLedgerSuccessResponse = {
  success: true;
  data: CreateLedgerData;
  message: string;
};

/** Backend errorResponseSchema: { success: false, error: { code?, message? } } */
type CreateLedgerApiError = {
  success: false;
  error?: {
    code?: string;
    message?: string;
  };
};

const DEFAULT_ERROR_MESSAGE = 'Failed to create ledger';

/** User-friendly messages for API status codes (400, 409 from schema) */
const STATUS_ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input.',
  401: 'Please sign in again.',
  403: 'You do not have permission to create ledgers.',
  409: 'A ledger with this name or details already exists, or the operation conflicts with existing data.',
  500: 'Something went wrong on the server. Please try again later.',
};

function getCreateLedgerError(
  data: CreateLedgerApiError | undefined,
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
 * Hook to create a ledger.
 * POST /ledgers
 * Validates payload with Zod. On success invalidates ledgers list and shows toast.
 */
export function useCreateLedger() {
  return useMutation<
    CreateLedgerSuccessResponse,
    AxiosError<CreateLedgerApiError>,
    CreateLedgerBody
  >({
    mutationKey: ['ledgers', 'create'],

    mutationFn: async (payload) => {
      const parsed = createLedgerBodySchema.safeParse(payload);
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
        await storeAdminAxiosClient.post<CreateLedgerSuccessResponse>(
          '/ledgers',
          parsed.data
        );
      return data;
    },

    onSuccess: (data) => {
      toast.success(data.message ?? 'Ledger created', {
        description: data.data?.name
          ? `${data.data.name} has been added`
          : undefined,
      });
      void queryClient.invalidateQueries({ queryKey: ledgersKeys.all });
    },

    onError: (error: AxiosError<CreateLedgerApiError> | Error) => {
      const isAxios = error instanceof AxiosError;
      const status = isAxios ? error.response?.status : undefined;
      const responseData = isAxios
        ? (error.response?.data as CreateLedgerApiError | undefined)
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
          ? getCreateLedgerError(responseData, status)
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
