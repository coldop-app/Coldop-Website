import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import * as z from 'zod';
import { queryClient } from '@/lib/queryClient';
import storeAdminAxiosClient from '@/lib/axios';
import { daybookKeys } from '@/services/store-admin/functions/useGetDaybook';

/* -------------------------------------------------
   API request body schema (matches backend)
-------------------------------------------------- */

const locationSchema = z.object({
  chamber: z.string().min(1, 'Chamber is required'),
  floor: z.string().min(1, 'Floor is required'),
  row: z.string().min(1, 'Row is required'),
});

const transferStockItemSchema = z.object({
  incomingGatePassId: z.string().min(1, 'Incoming gate pass ID is required'),
  bagSize: z.string().min(1, 'Bag size is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  location: locationSchema,
});

export const createTransferStockBodySchema = z.object({
  fromFarmerStorageLinkId: z
    .string()
    .min(1, 'From farmer storage link is required'),
  toFarmerStorageLinkId: z
    .string()
    .min(1, 'To farmer storage link is required'),
  date: z.string().min(1, 'Date is required'),
  truckNumber: z.string().trim().optional(),
  items: z
    .array(transferStockItemSchema)
    .min(1, 'At least one item is required'),
  remarks: z.string().trim().optional(),
});

export type CreateTransferStockBody = z.infer<
  typeof createTransferStockBodySchema
>;

/* -------------------------------------------------
   API response & error types (match backend schema)
-------------------------------------------------- */

export type CreateTransferStockSuccessResponse = {
  status: string;
  message: string;
  data: {
    fromFarmerStorageLinkId: string;
    toFarmerStorageLinkId: string;
    createdBy: string;
    gatePassNo: number;
    date: string;
    truckNumber?: string;
    items: Array<{
      incomingGatePassId: string;
      gatePassNo: number;
      bagSize: string;
      quantity: number;
      location: {
        chamber: string;
        floor: string;
        row: string;
      };
    }>;
    remarks?: string;
    createdIncomingGatePassId: string;
    _id: string;
    createdAt: string;
    updatedAt: string;
  };
};

export type CreateTransferStockApiError = {
  status?: string;
  statusCode?: number;
  errorCode?: string;
  message?: string;
};

const DEFAULT_ERROR_MESSAGE = 'Failed to create transfer stock gate pass';

const STATUS_ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input.',
  404: 'Farmer storage link or incoming gate pass not found.',
  409: 'Conflict while creating transfer stock gate pass.',
  500: 'Something went wrong on the server. Please try again later.',
};

function getCreateTransferStockError(
  data: CreateTransferStockApiError | undefined,
  status?: number
): { message: string; description?: string } {
  const apiMessage = data?.message;
  const fallbackMessage =
    status !== undefined && status in STATUS_ERROR_MESSAGES
      ? STATUS_ERROR_MESSAGES[status]
      : DEFAULT_ERROR_MESSAGE;
  const message =
    typeof apiMessage === 'string' && apiMessage.trim()
      ? apiMessage
      : fallbackMessage;
  const description = data?.errorCode ? `Code: ${data.errorCode}` : undefined;
  return { message, description };
}

/**
 * Hook to create a transfer stock gate pass.
 * POST /transfer-stock
 * Validates payload with Zod. On success/error shows toast via sonner.
 */
export function useCreateTransferStock() {
  const navigate = useNavigate();

  return useMutation<
    CreateTransferStockSuccessResponse,
    AxiosError<CreateTransferStockApiError>,
    CreateTransferStockBody
  >({
    mutationKey: ['transfer-stock', 'create'],

    mutationFn: async (payload) => {
      const parsed = createTransferStockBodySchema.safeParse(payload);
      if (!parsed.success) {
        const first = parsed.error.flatten().fieldErrors;
        const msg =
          typeof first === 'object' &&
          first !== null &&
          Object.keys(first).length
            ? (Object.entries(first)
                .map(([, v]) => (Array.isArray(v) ? v[0] : v))
                .filter(Boolean)[0] as string)
            : parsed.error.message;
        return Promise.reject(new Error(msg ?? 'Validation failed'));
      }

      const body = { ...parsed.data };
      if (body.date && /^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
        body.date = `${body.date}T00:00:00.000Z`;
      }

      const { data } =
        await storeAdminAxiosClient.post<CreateTransferStockSuccessResponse>(
          '/transfer-stock',
          body
        );
      return data;
    },

    onSuccess: (data) => {
      toast.success(data.message ?? 'Transfer stock gate pass created', {
        description: data.data?.gatePassNo
          ? `Gate pass #${data.data.gatePassNo} has been created`
          : undefined,
      });
      void queryClient.invalidateQueries({ queryKey: daybookKeys.all });
      void queryClient.invalidateQueries({
        queryKey: ['incoming-gate-pass'],
      });
      void queryClient.invalidateQueries({
        queryKey: ['transfer-stock'],
      });
      navigate({ to: '/store-admin/daybook' });
    },

    onError: (error: AxiosError<CreateTransferStockApiError> | Error) => {
      const isAxios = error instanceof AxiosError;
      const status = isAxios ? error.response?.status : undefined;
      const responseData = isAxios
        ? (error.response?.data as CreateTransferStockApiError | undefined)
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
          ? getCreateTransferStockError(responseData, status)
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

