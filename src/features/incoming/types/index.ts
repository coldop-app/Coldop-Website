import type * as z from 'zod';

import { incomingFormSchema } from '@/features/incoming/schemas/incoming-form-schema';

export type IncomingSubmitMeta = {
  submitAction: 'review' | 'submit';
};

export const defaultSubmitMeta: IncomingSubmitMeta = {
  submitAction: 'review',
};

export type IncomingFormValues = z.infer<typeof incomingFormSchema>;

export type {
  CreateIncomingGatePassBagSize,
  CreateIncomingGatePassPayload,
  CreateIncomingGatePassResponse,
  IncomingGatePassRecord,
  UpdateIncomingGatePassPayload,
  UpdateIncomingGatePassResponse,
} from '@/features/incoming/types/api';
