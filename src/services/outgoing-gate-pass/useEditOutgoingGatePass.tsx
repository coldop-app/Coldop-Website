import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import * as z from 'zod';
import { queryClient } from '@/lib/queryClient';
import storeAdminAxiosClient from '@/lib/axios';
import { daybookKeys } from '@/services/store-admin/functions/useGetDaybook';
import { incomingGatePassEntrySchema } from '@/services/outgoing-gate-pass/useCreateOutgoingGatePass';

/* -------------------------------------------------
   API request body schema (PATCH /outgoing-gate-pass/:id)
------------------------------------------------- */

const locationSchema = z.object({
  chamber: z.string(),
  floor: z.string(),
  row: z.string(),
});

/** PATCH allocations may omit location when not applicable. */
const editAllocationSchema = z.object({
  size: z.string().min(1, 'Size is required'),
  quantityToAllocate: z.number().int().min(1, 'Quantity must be at least 1'),
  location: locationSchema.optional(),
});

const editIncomingGatePassEntrySchema = incomingGatePassEntrySchema.extend({
  allocations: z
    .array(editAllocationSchema)
    .min(1, 'At least one allocation is required'),
});

export const editOutgoingGatePassBodySchema = z.object({
  incomingGatePasses: z
    .array(editIncomingGatePassEntrySchema)
    .min(1, 'At least one incoming gate pass with allocations is required'),
  date: z.string().min(1, 'Date is required'),
  from: z.string().trim().optional(),
  to: z.string().trim().optional(),
  truckNumber: z.string().trim().optional(),
  remarks: z.string().max(500).optional().default(''),
});

export type EditOutgoingGatePassBody = z.infer<
  typeof editOutgoingGatePassBodySchema
>;

export type EditOutgoingGatePassVariables = {
  id: string;
  body: EditOutgoingGatePassBody;
};

/* -------------------------------------------------
   API response & error types
------------------------------------------------- */

export type EditOutgoingGatePassSuccessResponse = {
  status: string;
  message: string;
  data: Record<string, unknown>;
};

export type EditOutgoingGatePassApiError = {
  status?: string;
  statusCode?: number;
  errorCode?: string;
  message?: string;
};

const DEFAULT_ERROR_MESSAGE = 'Failed to update outgoing gate pass';

const STATUS_ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input.',
  404: 'Outgoing or incoming gate pass not found.',
  409: 'Update conflict. Please refresh and try again.',
  500: 'Something went wrong on the server. Please try again later.',
};

function getEditOutgoingGatePassError(
  data: EditOutgoingGatePassApiError | undefined,
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

function normalizeDateForApi(date: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return `${date}T00:00:00.000Z`;
  }
  return date;
}

/**
 * Hook to update an outgoing gate pass.
 * PATCH /outgoing-gate-pass/:id
 */
export function useEditOutgoingGatePass() {
  const navigate = useNavigate();

  return useMutation<
    EditOutgoingGatePassSuccessResponse,
    AxiosError<EditOutgoingGatePassApiError> | Error,
    EditOutgoingGatePassVariables
  >({
    mutationKey: ['outgoing-gate-pass', 'edit'],

    mutationFn: async ({ id, body }) => {
      const parsed = editOutgoingGatePassBodySchema.safeParse(body);
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

      const payload = {
        ...parsed.data,
        date: normalizeDateForApi(parsed.data.date),
      };

      const { data } =
        await storeAdminAxiosClient.patch<EditOutgoingGatePassSuccessResponse>(
          `/outgoing-gate-pass/${id}`,
          payload
        );
      return data;
    },

    onSuccess: (data) => {
      toast.success(data.message ?? 'Outgoing gate pass updated', {
        description: data.data ? 'You can view it in daybook' : undefined,
      });
      void queryClient.invalidateQueries({ queryKey: daybookKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['incoming-gate-pass'] });
      void queryClient.invalidateQueries({ queryKey: ['outgoing-gate-pass'] });
      navigate({ to: '/store-admin/daybook' });
    },

    onError: (error) => {
      const isAxios = error instanceof AxiosError;
      const status = isAxios ? error.response?.status : undefined;
      const responseData = isAxios
        ? (error.response?.data as EditOutgoingGatePassApiError | undefined)
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
          ? getEditOutgoingGatePassError(responseData, status)
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
