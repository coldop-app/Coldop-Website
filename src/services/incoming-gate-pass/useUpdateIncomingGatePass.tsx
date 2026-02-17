import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import * as z from 'zod';
import { queryClient } from '@/lib/queryClient';
import storeAdminAxiosClient from '@/lib/axios';
import { daybookKeys } from '@/services/store-admin/functions/useGetDaybook';

/* -------------------------------------------------
   API request body schema (PATCH - partial update)
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

export const updateIncomingGatePassBodySchema = z.object({
  date: z.string().optional(), // ISO format e.g. 2026-02-12T00:00:00.000+00:00
  variety: z.string().min(1).optional(),
  remarks: z.string().max(500).optional(),
  bagSizes: z.array(bagSizeSchema).optional(),
  amount: z.number().min(0).optional(),
});

export type UpdateIncomingGatePassBody = z.infer<
  typeof updateIncomingGatePassBodySchema
>;

export type UpdateIncomingGatePassVariables = {
  id: string;
  payload: UpdateIncomingGatePassBody;
};

/* -------------------------------------------------
   API response & error types
------------------------------------------------- */

type UpdateIncomingGatePassSuccessResponse = {
  success: true;
  data: Record<string, unknown>;
  message?: string;
};

type UpdateIncomingGatePassApiError = {
  success?: boolean;
  message?: string;
  error?: { code?: string; message?: string };
};

const DEFAULT_ERROR_MESSAGE = 'Failed to update incoming gate pass';

const STATUS_ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input.',
  404: 'Incoming gate pass not found.',
  409: 'A conflict occurred while updating.',
  500: 'Something went wrong on the server. Please try again later.',
};

function getUpdateIncomingGatePassError(
  data: UpdateIncomingGatePassApiError | undefined,
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
 * Hook to update an incoming gate pass.
 * PATCH /incoming-gate-pass/:id
 * Validates payload with Zod. On success/error shows toast via sonner.
 */
export function useUpdateIncomingGatePass() {
  const navigate = useNavigate();

  return useMutation<
    UpdateIncomingGatePassSuccessResponse,
    AxiosError<UpdateIncomingGatePassApiError>,
    UpdateIncomingGatePassVariables
  >({
    mutationKey: ['incoming-gate-pass', 'update'],

    mutationFn: async ({ id, payload }) => {
      const parsed = updateIncomingGatePassBodySchema.safeParse(payload);
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

      const body = parsed.data;

      const { data } =
        await storeAdminAxiosClient.patch<UpdateIncomingGatePassSuccessResponse>(
          `/incoming-gate-pass/${id}`,
          body
        );
      return data;
    },

    onSuccess: (data) => {
      toast.success(data.message ?? 'Incoming gate pass updated', {
        description: data.data ? 'Changes are reflected in daybook' : undefined,
      });
      void queryClient.invalidateQueries({ queryKey: daybookKeys.all });
      navigate({ to: '/store-admin/daybook' });
    },

    onError: (error: AxiosError<UpdateIncomingGatePassApiError> | Error) => {
      const isAxios = error instanceof AxiosError;
      const status = isAxios ? error.response?.status : undefined;
      const responseData = isAxios
        ? (error.response?.data as UpdateIncomingGatePassApiError | undefined)
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
          ? getUpdateIncomingGatePassError(responseData, status)
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
