import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import * as z from 'zod';
import { queryClient } from '@/lib/queryClient';
import storeAdminAxiosClient from '@/lib/axios';
import { daybookKeys } from '@/services/store-admin/functions/useGetDaybook';
import { vouchersKeys } from '@/services/accounting/vouchers/useGetAllVouchers';

/* -------------------------------------------------
   API request body schema (matches backend)
------------------------------------------------- */

const locationSchema = z.object({
  chamber: z.string().min(1, 'Chamber is required'),
  floor: z.string().min(1, 'Floor is required'),
  row: z.string().min(1, 'Row is required'),
});

const bagSizeSchema = z.object({
  name: z.string().min(1, 'Bag size name is required'),
  initialQuantity: z.number().int().min(0, 'Initial quantity must be ≥ 0'),
  currentQuantity: z.number().int().min(0, 'Current quantity must be ≥ 0'),
  location: locationSchema,
  paltaiLocation: locationSchema.optional(),
});

export const createIncomingGatePassBodySchema = z.object({
  farmerStorageLinkId: z.string().min(1, 'Farmer storage link is required'),
  date: z.string().min(1, 'Date is required'),
  variety: z.string().min(1, 'Variety is required'),
  truckNumber: z.string().trim().optional(),
  bagSizes: z.array(bagSizeSchema).min(1, 'At least one bag size is required'),
  remarks: z.string().max(500).optional().default(''),
  manualParchiNumber: z.string().trim().optional(),
  amount: z.number().min(0).optional(),
});

export type CreateIncomingGatePassBody = z.infer<
  typeof createIncomingGatePassBodySchema
>;

/* -------------------------------------------------
   API response & error types
------------------------------------------------- */

type CreateIncomingGatePassSuccessResponse = {
  success: true;
  data: Record<string, unknown>;
  message?: string;
};

type CreateIncomingGatePassApiError = {
  success?: boolean;
  message?: string;
  error?: { code?: string; message?: string };
};

const DEFAULT_ERROR_MESSAGE = 'Failed to create incoming gate pass';

const STATUS_ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input.',
  404: 'Farmer-storage link not found.',
  409: 'A gate pass with these details already exists.',
  500: 'Something went wrong on the server. Please try again later.',
};

function getCreateIncomingGatePassError(
  data: CreateIncomingGatePassApiError | undefined,
  status?: number
): { message: string; description?: string } {
  const apiMessage = data?.error?.message ?? data?.message;
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
 * Hook to create an incoming gate pass.
 * POST /incoming-gate-pass
 * Validates payload with Zod. On success/error shows toast via sonner.
 */
export function useCreateIncomingGatePass() {
  const navigate = useNavigate();

  return useMutation<
    CreateIncomingGatePassSuccessResponse,
    AxiosError<CreateIncomingGatePassApiError>,
    CreateIncomingGatePassBody
  >({
    mutationKey: ['incoming-gate-pass', 'create'],

    mutationFn: async (payload) => {
      const parsed = createIncomingGatePassBodySchema.safeParse(payload);
      if (!parsed.success) {
        const first = parsed.error.flatten().fieldErrors;
        const msg =
          typeof first === 'object' &&
          first !== null &&
          Object.keys(first).length
            ? Object.entries(first)
                .map(([, v]) => (Array.isArray(v) ? v[0] : v))
                .filter(Boolean)[0]
            : parsed.error.message;
        return Promise.reject(new Error(msg ?? 'Validation failed'));
      }

      const body = { ...parsed.data };
      if (body.date && /^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
        body.date = `${body.date}T00:00:00.000Z`;
      }

      const { data } =
        await storeAdminAxiosClient.post<CreateIncomingGatePassSuccessResponse>(
          '/incoming-gate-pass',
          body
        );
      return data;
    },

    onSuccess: (data) => {
      toast.success(data.message ?? 'Incoming gate pass created', {
        description: data.data ? 'You can view it in daybook' : undefined,
      });
      void queryClient.invalidateQueries({ queryKey: daybookKeys.all });
      void queryClient.invalidateQueries({ queryKey: vouchersKeys.all });
      navigate({ to: '/store-admin/daybook' });
    },

    onError: (error: AxiosError<CreateIncomingGatePassApiError> | Error) => {
      const isAxios = error instanceof AxiosError;
      const status = isAxios ? error.response?.status : undefined;
      const responseData = isAxios
        ? (error.response?.data as CreateIncomingGatePassApiError | undefined)
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
          ? getCreateIncomingGatePassError(responseData, status)
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
