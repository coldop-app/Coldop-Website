import * as z from 'zod';

import type { CreateVoucherPayload } from '@/features/finances/types';
import { parseVoucherAmount } from '@/features/finances/components/voucher-tab/schemas/add-voucher-form-schema';

export const farmerFinanceVoucherFormSchema = z
  .object({
    date: z.string().datetime('Select a valid date'),
    amount: z.string().trim().min(1, 'Amount is required'),
    narration: z.string().max(500, 'Narration must be 500 characters or fewer'),
  })
  .superRefine((values, ctx) => {
    const parsedAmount = Number(values.amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount < 0.01) {
      ctx.addIssue({
        code: 'custom',
        message: 'Enter an amount of at least 0.01',
        path: ['amount'],
      });
    }
  });

export type FarmerFinanceVoucherFormValues = z.infer<typeof farmerFinanceVoucherFormSchema>;

export function formValuesToFarmerFinanceVoucherPayload(
  values: FarmerFinanceVoucherFormValues,
  debitLedgerId: string,
  creditLedgerId: string,
): CreateVoucherPayload {
  const narration = values.narration.trim();

  return {
    date: values.date,
    debitLedger: debitLedgerId,
    creditLedger: creditLedgerId,
    amount: parseVoucherAmount(values.amount),
    ...(narration ? { narration } : {}),
  };
}
