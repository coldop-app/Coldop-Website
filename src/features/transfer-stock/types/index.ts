import type * as z from 'zod';

import { transferStockFormSchema } from '@/features/transfer-stock/schemas/transfer-stock-form-schema';

export type TransferStockSubmitMeta = {
  submitAction: 'review' | 'submit';
};

export const defaultSubmitMeta: TransferStockSubmitMeta = {
  submitAction: 'review',
};

export type TransferStockFormValues = z.infer<typeof transferStockFormSchema>;

export type {
  CreateTransferStockPayload,
  CreateTransferStockResponse,
  TransferStockRecord,
} from '@/features/transfer-stock/types/api';
