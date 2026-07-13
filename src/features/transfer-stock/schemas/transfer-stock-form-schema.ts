import * as z from 'zod';

export const objectId = z.string().length(24, 'Select a valid record from the list.');

export type TransferStockFormSchemaConfig = {
  requireCustomMarka: boolean;
};

function customMarkaSchema(requireCustomMarka: boolean) {
  return requireCustomMarka ? z.string().min(1, 'Enter a custom marka.') : z.string();
}

export const transferStockAllocationSchema = z.object({
  storageGatePassId: objectId,
  bagSize: z.string().min(1, 'Bag size is required'),
  bagIndex: z.number().int().min(0).default(0),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  location: z.object({
    chamber: z.string(),
    floor: z.string(),
    row: z.string(),
  }),
});

export function createTransferStockFormSchema(config: TransferStockFormSchemaConfig) {
  return z
    .object({
      fromFarmerStorageLinkId: objectId,
      toFarmerStorageLinkId: objectId,
      date: z.string().min(1, 'Date is required'),
      customMarka: customMarkaSchema(config.requireCustomMarka),
      remarks: z.string().max(500),
      allocations: z
        .record(z.string(), z.number().int().min(1))
        .refine((obj) => Object.keys(obj).length > 0, {
          message: 'Select at least one allocation in the gate passes table',
        }),
    })
    .refine((d) => d.fromFarmerStorageLinkId !== d.toFarmerStorageLinkId, {
      message: 'Source and destination must be different accounts',
      path: ['toFarmerStorageLinkId'],
    });
}

export const transferStockFormSchema = createTransferStockFormSchema({
  requireCustomMarka: false,
});

export type TransferStockFormValues = z.infer<typeof transferStockFormSchema>;
export type TransferStockAllocationItem = z.infer<typeof transferStockAllocationSchema>;
