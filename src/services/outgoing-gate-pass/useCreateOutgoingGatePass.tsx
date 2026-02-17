import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import * as z from 'zod';
import { queryClient } from '@/lib/queryClient';
import storeAdminAxiosClient from '@/lib/axios';
import { daybookKeys } from '@/services/store-admin/functions/useGetDaybook';
import { voucherNumberKeys } from '@/services/store-admin/functions/useGetVoucherNumber';

/* -------------------------------------------------
   API request body schema (matches backend)
------------------------------------------------- */

/** Location for an allocation (chamber, floor, row). */
const locationSchema = z.object({
  chamber: z.string(),
  floor: z.string(),
  row: z.string(),
});

/** API allocation: size, quantity, and location. */
const allocationSchema = z.object({
  size: z.string().min(1, 'Size is required'),
  quantityToAllocate: z.number().int().min(1, 'Quantity must be at least 1'),
  location: locationSchema,
});

const incomingGatePassEntrySchema = z.object({
  incomingGatePassId: z.string().min(1, 'Incoming gate pass ID is required'),
  variety: z.string().min(1, 'Variety is required'),
  allocations: z
    .array(allocationSchema)
    .min(1, 'At least one allocation is required'),
});

export const createOutgoingGatePassBodySchema = z.object({
  farmerStorageLinkId: z.string().min(1, 'Farmer storage link is required'),
  gatePassNo: z.number().int().min(1, 'Gate pass number must be at least 1'),
  date: z.string().min(1, 'Date is required'),
  from: z.string().trim().optional(),
  to: z.string().trim().optional(),
  truckNumber: z.string().trim().optional(),
  manualParchiNumber: z.optional(
    z.coerce
      .number()
      .int('Manual parchi number must be an integer')
      .positive('Manual parchi number must be a positive number')
  ),
  incomingGatePasses: z
    .array(incomingGatePassEntrySchema)
    .min(1, 'At least one incoming gate pass with allocations is required'),
  remarks: z.string().max(500).optional().default(''),
});

export type CreateOutgoingGatePassBody = z.infer<
  typeof createOutgoingGatePassBodySchema
>;

export type OutgoingGatePassAllocation = z.infer<typeof allocationSchema>;
export type OutgoingGatePassIncomingEntry = z.infer<
  typeof incomingGatePassEntrySchema
>;

/* -------------------------------------------------
   API response & error types (match backend schema)
------------------------------------------------- */

export type CreateOutgoingGatePassSuccessResponse = {
  status: string;
  message: string;
  data: Record<string, unknown>;
};

/** Backend error shape: 400, 404, 409 */
export type CreateOutgoingGatePassApiError = {
  status?: string;
  statusCode?: number;
  errorCode?: string;
  message?: string;
};

const DEFAULT_ERROR_MESSAGE = 'Failed to create outgoing gate pass';

const STATUS_ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input.',
  404: 'Incoming gate pass or farmer link not found.',
  409: 'A gate pass with this number already exists.',
  500: 'Something went wrong on the server. Please try again later.',
};

function getCreateOutgoingGatePassError(
  data: CreateOutgoingGatePassApiError | undefined,
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
 * Hook to create an outgoing gate pass.
 * POST /outgoing-gate-pass
 * Validates payload with Zod. On success/error shows toast via sonner.
 */
export function useCreateOutgoingGatePass() {
  const navigate = useNavigate();

  return useMutation<
    CreateOutgoingGatePassSuccessResponse,
    AxiosError<CreateOutgoingGatePassApiError>,
    CreateOutgoingGatePassBody
  >({
    mutationKey: ['outgoing-gate-pass', 'create'],

    mutationFn: async (payload) => {
      const parsed = createOutgoingGatePassBodySchema.safeParse(payload);
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
        await storeAdminAxiosClient.post<CreateOutgoingGatePassSuccessResponse>(
          '/outgoing-gate-pass',
          body
        );
      return data;
    },

    onSuccess: (data) => {
      toast.success(data.message ?? 'Outgoing gate pass created', {
        description: data.data ? 'You can view it in daybook' : undefined,
      });
      void queryClient.invalidateQueries({ queryKey: daybookKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['incoming-gate-pass'] });
      void queryClient.invalidateQueries({ queryKey: ['outgoing-gate-pass'] });
      void queryClient.invalidateQueries({
        queryKey: voucherNumberKeys.detail('outgoing'),
      });
      navigate({ to: '/store-admin/daybook' });
    },

    onError: (error: AxiosError<CreateOutgoingGatePassApiError> | Error) => {
      const isAxios = error instanceof AxiosError;
      const status = isAxios ? error.response?.status : undefined;
      const responseData = isAxios
        ? (error.response?.data as CreateOutgoingGatePassApiError | undefined)
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
          ? getCreateOutgoingGatePassError(responseData, status)
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
