import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import * as z from 'zod';
import { queryClient } from '@/lib/queryClient';
import storeAdminAxiosClient from '@/lib/axios';
import { daybookKeys } from '@/services/store-admin/functions/useGetDaybook';
import { payloadDateSchema } from '@/lib/helpers';
import type { IncomingGatePassItem } from '@/services/incoming-gate-pass/useGetIncomingGatePassesOfSingleFarmer';
import {
  getBagDetailsForSize,
  parseAllocationKey,
} from '@/components/forms/outgoing/outgoing-form-utils';

const transferStockLocationSchema = z.object({
  chamber: z.string(),
  floor: z.string(),
  row: z.string(),
});

export const transferStockItemSchema = z.object({
  incomingGatePassId: z.string().min(1, 'Incoming gate pass ID is required'),
  bagSize: z.string().min(1, 'Bag size is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  location: transferStockLocationSchema,
});

export const createTransferStockGatePassBodySchema = z
  .object({
    fromFarmerStorageLinkId: z
      .string()
      .min(1, 'Source farmer is required'),
    toFarmerStorageLinkId: z
      .string()
      .min(1, 'Destination farmer is required'),
    date: z.string().min(1, 'Date is required'),
    items: z
      .array(transferStockItemSchema)
      .min(1, 'At least one line item is required'),
    remarks: z.string().max(500).optional().default(''),
  })
  .refine((d) => d.fromFarmerStorageLinkId !== d.toFarmerStorageLinkId, {
    message: 'Source and destination must be different accounts',
    path: ['toFarmerStorageLinkId'],
  });

export type CreateTransferStockGatePassBody = z.infer<
  typeof createTransferStockGatePassBodySchema
>;

export type CreateTransferStockGatePassSuccessResponse = {
  status: string;
  message: string;
  data: Record<string, unknown>;
};

export type CreateTransferStockGatePassApiError = {
  status?: string;
  statusCode?: number;
  errorCode?: string;
  message?: string;
};

export const transferStockGatePassKeys = {
  all: ['transfer-stock-gate-pass'] as const,
  list: () => [...transferStockGatePassKeys.all, 'list'] as const,
};

const DEFAULT_ERROR_MESSAGE = 'Failed to create transfer stock gate pass';

const STATUS_ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request or validation error.',
  404: 'Farmer storage link or gate pass not found.',
  409: 'Could not complete transfer (conflict).',
  500: 'Something went wrong on the server. Please try again later.',
};

function getCreateTransferStockGatePassError(
  data: CreateTransferStockGatePassApiError | undefined,
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
 * Build POST body from form values and per-cell quantities (same allocation shape as outgoing).
 * Returns null if nothing is allocated.
 */
export function buildTransferStockPayload(
  formValues: {
    fromFarmerStorageLinkId: string;
    toFarmerStorageLinkId: string;
    date: string;
    remarks: string;
  },
  cellRemovedQuantities: Record<string, number>,
  incomingPasses: IncomingGatePassItem[] = []
): CreateTransferStockGatePassBody | null {
  const entries = Object.entries(cellRemovedQuantities).filter(
    ([, qty]) => qty != null && qty > 0
  );
  if (entries.length === 0) return null;

  const passById = new Map(incomingPasses.map((p) => [p._id, p]));

  const items: z.infer<typeof transferStockItemSchema>[] = [];

  for (const [key, qty] of entries) {
    const parsed = parseAllocationKey(key);
    if (!parsed) continue;
    const { passId, sizeName, bagIndex } = parsed;
    const pass = passById.get(passId);
    if (!pass) continue;
    const details = getBagDetailsForSize(pass, sizeName);
    const detail = details[bagIndex];
    const location = detail?.location
      ? {
          chamber: String(detail.location.chamber ?? ''),
          floor: String(detail.location.floor ?? ''),
          row: String(detail.location.row ?? ''),
        }
      : { chamber: '', floor: '', row: '' };
    const quantity = Math.round(Number(qty));
    if (!Number.isFinite(quantity) || quantity < 1) continue;

    items.push({
      incomingGatePassId: passId,
      bagSize: sizeName,
      quantity,
      location,
    });
  }

  if (items.length === 0) return null;

  const dateNormalized = payloadDateSchema.parse(formValues.date);
  const date =
    /^\d{4}-\d{2}-\d{2}/.exec(dateNormalized)?.[0] ?? dateNormalized.slice(0, 10);

  return {
    fromFarmerStorageLinkId: formValues.fromFarmerStorageLinkId,
    toFarmerStorageLinkId: formValues.toFarmerStorageLinkId,
    date,
    items,
    remarks: formValues.remarks?.trim() ?? '',
  };
}

/**
 * Create a transfer stock gate pass (move stock between farmer accounts).
 * POST /transfer-stock
 */
export function useCreateTransferStockGatePass() {
  const navigate = useNavigate();

  return useMutation<
    CreateTransferStockGatePassSuccessResponse,
    AxiosError<CreateTransferStockGatePassApiError>,
    CreateTransferStockGatePassBody
  >({
    mutationKey: [...transferStockGatePassKeys.all, 'create'],

    mutationFn: async (payload) => {
      const parsed = createTransferStockGatePassBodySchema.safeParse(payload);
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

      const body = parsed.data;

      const { data } =
        await storeAdminAxiosClient.post<CreateTransferStockGatePassSuccessResponse>(
          '/transfer-stock',
          {
            ...body,
            remarks: body.remarks?.trim() ?? '',
          }
        );
      return data;
    },

    onSuccess: (data) => {
      toast.success(data.message ?? 'Transfer stock gate pass created', {
        description: data.data ? 'Daybook will update shortly' : undefined,
      });
      void queryClient.invalidateQueries({ queryKey: daybookKeys.all });
      void queryClient.invalidateQueries({
        queryKey: transferStockGatePassKeys.all,
      });
      void queryClient.invalidateQueries({ queryKey: ['incoming-gate-pass'] });
      navigate({ to: '/store-admin/daybook' });
    },

    onError: (
      error: AxiosError<CreateTransferStockGatePassApiError> | Error
    ) => {
      const isAxios = error instanceof AxiosError;
      const status = isAxios ? error.response?.status : undefined;
      const responseData = isAxios
        ? (error.response
            ?.data as CreateTransferStockGatePassApiError | undefined)
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
          ? getCreateTransferStockGatePassError(responseData, status)
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
