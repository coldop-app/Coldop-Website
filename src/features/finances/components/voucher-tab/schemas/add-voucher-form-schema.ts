import type { CreateVoucherPayload, UpdateVoucherPayload } from '@/features/finances/types';
import type { ComboboxOption } from '@/components/searchable-option-combobox';

import type { Voucher } from '../types';
import * as z from 'zod';

export const addVoucherFormSchema = z
  .object({
    date: z.string().datetime('Select a valid date'),
    debitLedger: z.string().min(1, 'Select a debit ledger'),
    creditLedger: z.string().min(1, 'Select a credit ledger'),
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

    if (values.debitLedger && values.creditLedger && values.debitLedger === values.creditLedger) {
      ctx.addIssue({
        code: 'custom',
        message: 'Debit and credit ledgers must be different',
        path: ['creditLedger'],
      });
    }
  });

export type AddVoucherFormValues = z.infer<typeof addVoucherFormSchema>;

export function parseVoucherAmount(value: string): number {
  return Number(value);
}

function buildVoucherPayload(values: AddVoucherFormValues): CreateVoucherPayload {
  const narration = values.narration.trim();

  return {
    date: values.date,
    debitLedger: values.debitLedger,
    creditLedger: values.creditLedger,
    amount: parseVoucherAmount(values.amount),
    ...(narration ? { narration } : {}),
  };
}

export function formValuesToCreatePayload(values: AddVoucherFormValues): CreateVoucherPayload {
  return buildVoucherPayload(values);
}

export function formValuesToUpdatePayload(values: AddVoucherFormValues): UpdateVoucherPayload {
  return {
    ...buildVoucherPayload(values),
    narration: values.narration.trim(),
  };
}

function resolveLedgerId(
  ledgerId: string | undefined,
  ledgerName: string,
  ledgerOptions: ComboboxOption[],
): string {
  if (ledgerId) {
    return ledgerId;
  }

  if (!ledgerName) {
    return '';
  }

  return ledgerOptions.find((option) => option.label === ledgerName)?.id ?? '';
}

export function voucherToFormValues(
  voucher: Voucher,
  ledgerOptions: ComboboxOption[] = [],
): AddVoucherFormValues {
  return {
    date: voucher.date,
    debitLedger: resolveLedgerId(voucher.debitLedgerId, voucher.debit, ledgerOptions),
    creditLedger: resolveLedgerId(voucher.creditLedgerId, voucher.credit, ledgerOptions),
    amount: String(voucher.amount),
    narration: voucher.narration ?? '',
  };
}
