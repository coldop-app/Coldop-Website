import * as z from 'zod';

import type { CreateVoucherPayload } from '@/features/finances/types';
import { parseVoucherAmount } from '@/features/finances/components/voucher-tab/schemas/add-voucher-form-schema';

export const farmerFinancePaymentVoucherFormSchema = z
  .object({
    date: z.string().datetime('Select a valid date'),
    paymentLedger: z.string().min(1, 'Select a ledger'),
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

export type FarmerFinancePaymentVoucherFormValues = z.infer<
  typeof farmerFinancePaymentVoucherFormSchema
>;

export type FarmerFinancePaymentVoucherMode = 'receive' | 'add';

export function formValuesToFarmerFinancePaymentVoucherPayload(
  values: FarmerFinancePaymentVoucherFormValues,
  mode: FarmerFinancePaymentVoucherMode,
  farmerLedgerId: string,
): CreateVoucherPayload {
  const narration = values.narration.trim();

  return {
    date: values.date,
    debitLedger: mode === 'receive' ? values.paymentLedger : farmerLedgerId,
    creditLedger: mode === 'receive' ? farmerLedgerId : values.paymentLedger,
    amount: parseVoucherAmount(values.amount),
    ...(narration ? { narration } : {}),
  };
}
