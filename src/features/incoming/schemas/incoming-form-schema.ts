import * as z from 'zod';
import { createIncomingQuantitiesSchema } from '@/features/incoming/schemas/incoming-quantities-schema';
import { TRUCK_NUMBER_MAX_LENGTH } from '@/lib/form-utils';

export const objectId = z.string().length(24, 'Select a valid record from the list.');

export type IncomingFormSchemaConfig = {
  requireCommodity: boolean;
  requireStockFilter: boolean;
  requireCustomMarka: boolean;
  bagSizes: string[];
};

function commoditySchema(requireCommodity: boolean) {
  return requireCommodity ? z.string().min(1, 'Select a commodity.') : z.string();
}

function stockFilterSchema(requireStockFilter: boolean) {
  return requireStockFilter ? z.string().min(1, 'Select a stock filter.') : z.string();
}

function customMarkaSchema(requireCustomMarka: boolean) {
  return requireCustomMarka ? z.string().min(1, 'Enter a custom marka.') : z.string();
}

export function createIncomingFormSchema(config: IncomingFormSchemaConfig) {
  const incomingBaseSchema = z.object({
    gatePassNo: z.number().int().positive('Gate pass number is required.'),
    manualGatePassNumber: z.union([
      z.undefined(),
      z.number().positive('Enter a positive gate pass number.'),
    ]),
    farmerIncomingLinkId: objectId,
    createdBy: objectId,
    commodity: commoditySchema(config.requireCommodity),
    variety: z.string().min(1, 'Select a variety.'),
    stockFilter: stockFilterSchema(config.requireStockFilter),
    customMarka: customMarkaSchema(config.requireCustomMarka),
    date: z.string().datetime('Select a valid date.'),
    truckNumber: z
      .string()
      .max(
        TRUCK_NUMBER_MAX_LENGTH,
        `Truck number must be at most ${TRUCK_NUMBER_MAX_LENGTH} characters.`,
      ),
    remarks: z.string(),
  });

  return incomingBaseSchema.merge(createIncomingQuantitiesSchema(config.bagSizes));
}

export const incomingFormSchema = createIncomingFormSchema({
  requireCommodity: false,
  requireStockFilter: false,
  requireCustomMarka: false,
  bagSizes: [],
});

export {
  incomingQuantitiesSchema,
  createDefaultIncomingQuantities,
  createEmptyIncomingQuantityRow,
  type IncomingQuantityRow,
} from '@/features/incoming/schemas/incoming-quantities-schema';
