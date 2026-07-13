import { z } from 'zod';

export const potatoActionSchema = z.enum(['buy', 'sell']);

export const transferStockSearchSchema = z.object({
  farmerLinkId: z.string().length(24).optional(),
  potatoAction: potatoActionSchema.optional(),
});

export type PotatoAction = z.infer<typeof potatoActionSchema>;
export type TransferStockSearch = z.infer<typeof transferStockSearchSchema>;
