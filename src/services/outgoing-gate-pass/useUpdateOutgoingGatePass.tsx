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
   API request body schema (PATCH - matches backend)
------------------------------------------------- */

export const updateOutgoingGatePassBodySchema = z.object({
  farmerStorageLinkId: z.string().min(1, 'Farmer storage link is required'),
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

export type UpdateOutgoingGatePassBody = z.infer<
  typeof updateOutgoingGatePassBodySchema
>;

export type UpdateOutgoingGatePassVariables = {
  id: string;
  payload: UpdateOutgoingGatePassBody;
};

/* -------------------------------------------------
   API response & error types
------------------------------------------------- */

type UpdateOutgoingGatePassSuccessResponse = {
  status: string;
  message: string;
  data: Record<string, unknown>;
};

type UpdateOutgoingGatePassApiError = {
  status?: string;
  statusCode?: number;
  errorCode?: string;
  message?: string;
};

const DEFAULT_ERROR_MESSAGE = 'Failed to update outgoing gate pass';

const STATUS_ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input.',
  404: 'Outgoing gate pass not found.',
  409: 'A conflict occurred while updating.',
  500: 'Something went wrong on the server. Please try again later.',
};

function getUpdateOutgoingGatePassError(
  data: UpdateOutgoingGatePassApiError | undefined,
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
 * Hook to update an outgoing gate pass.
 * PATCH /outgoing-gate-pass/:id
 */
export function useUpdateOutgoingGatePass() {
  const navigate = useNavigate();

  return useMutation<
    UpdateOutgoingGatePassSuccessResponse,
    AxiosError<UpdateOutgoingGatePassApiError>,
    UpdateOutgoingGatePassVariables
  >({
    mutationKey: ['outgoing-gate-pass', 'update'],

    mutationFn: async ({ id, payload }) => {
      const parsed = updateOutgoingGatePassBodySchema.safeParse(payload);
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
        await storeAdminAxiosClient.patch<UpdateOutgoingGatePassSuccessResponse>(
          `/outgoing-gate-pass/${id}`,
          body
        );
      return data;
    },

    onSuccess: (data) => {
      toast.success(data.message ?? 'Outgoing gate pass updated', {
        description: data.data ? 'Changes are reflected in daybook' : undefined,
      });
      void queryClient.invalidateQueries({ queryKey: daybookKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['incoming-gate-pass'] });
      void queryClient.invalidateQueries({ queryKey: ['outgoing-gate-pass'] });
      navigate({ to: '/store-admin/daybook' });
    },

    onError: (error: AxiosError<UpdateOutgoingGatePassApiError> | Error) => {
      const isAxios = error instanceof AxiosError;
      const status = isAxios ? error.response?.status : undefined;
      const responseData = isAxios
        ? (error.response?.data as UpdateOutgoingGatePassApiError | undefined)
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
          ? getUpdateOutgoingGatePassError(responseData, status)
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
