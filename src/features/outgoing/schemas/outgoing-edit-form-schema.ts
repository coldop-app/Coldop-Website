import * as z from 'zod';

import { objectId } from '@/features/outgoing/schemas/outgoing-form-schema';
import { TRUCK_NUMBER_MAX_LENGTH } from '@/lib/form-utils';

export type OutgoingEditFormSchemaConfig = {
  requireStockFilter: boolean;
};

function stockFilterSchema(requireStockFilter: boolean) {
  return requireStockFilter ? z.string().min(1, 'Select a stock filter.') : z.string();
}

export function createOutgoingEditFormSchema(config: OutgoingEditFormSchemaConfig) {
  return z.object({
    farmerStorageLinkId: objectId,
    date: z.string().min(1, 'Date is required'),
    stockFilter: stockFilterSchema(config.requireStockFilter),
    manualGatePassNumber: z.union([
      z.undefined(),
      z.number().int().positive('Manual gate pass number must be positive.'),
    ]),
    from: z.string().max(200),
    to: z.string().max(200),
    truckNumber: z
      .string()
      .max(
        TRUCK_NUMBER_MAX_LENGTH,
        `Truck number must be at most ${TRUCK_NUMBER_MAX_LENGTH} characters.`,
      ),
    remarks: z.string().max(500),
    allocations: z
      .record(z.string(), z.number().int().min(1))
      .refine((obj) => Object.keys(obj).length > 0, {
        message: 'Select at least one allocation in the gate passes table',
      }),
  });
}

export const outgoingEditFormSchema = createOutgoingEditFormSchema({
  requireStockFilter: false,
});

export type OutgoingEditFormValues = z.infer<typeof outgoingEditFormSchema>;
