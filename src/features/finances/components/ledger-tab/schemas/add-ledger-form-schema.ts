import * as z from 'zod';

import type { Ledger } from '@/features/finances/components/ledger-tab/types';
import type { CreateLedgerPayload, UpdateLedgerPayload } from '@/features/finances/types';
import {
  getCategoriesForTypeSubType,
  getSubTypesForType,
  LEDGER_TYPES,
} from '@/features/finances/shared/chart-of-accounts';

function validateLedgerFormValues(
  values: {
    type: string;
    subType: string;
    category: string;
    openingBalance: string;
    closingBalance?: string;
  },
  ctx: z.RefinementCtx,
) {
  if (values.type && !LEDGER_TYPES.includes(values.type as (typeof LEDGER_TYPES)[number])) {
    ctx.addIssue({
      code: 'custom',
      message: 'Select a type',
      path: ['type'],
    });
  }

  if (values.type && values.subType) {
    const validSubTypes = getSubTypesForType(values.type as (typeof LEDGER_TYPES)[number]);
    if (!validSubTypes.includes(values.subType)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Select a sub type',
        path: ['subType'],
      });
    }
  }

  if (values.type && values.subType && values.category) {
    const validCategories = getCategoriesForTypeSubType(
      values.type as (typeof LEDGER_TYPES)[number],
      values.subType,
    );
    if (!validCategories.includes(values.category)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Select a category',
        path: ['category'],
      });
    }
  }

  if (values.openingBalance.trim() !== '') {
    const parsed = Number(values.openingBalance);
    if (!Number.isFinite(parsed)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Enter a valid amount',
        path: ['openingBalance'],
      });
    }
  }

  if (values.closingBalance && values.closingBalance.trim() !== '') {
    const parsed = Number(values.closingBalance);
    if (!Number.isFinite(parsed)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Enter a valid amount',
        path: ['closingBalance'],
      });
    }
  }
}

const ledgerFormFields = {
  name: z.string().trim().min(1, 'Name is required'),
  type: z.string().min(1, 'Select a type'),
  subType: z.string().min(1, 'Select a sub type'),
  category: z.string().min(1, 'Select a category'),
  openingBalance: z.string(),
  closingBalance: z.string(),
};

export const addLedgerFormSchema = z
  .object({
    name: ledgerFormFields.name,
    type: ledgerFormFields.type,
    subType: ledgerFormFields.subType,
    category: ledgerFormFields.category,
    openingBalance: ledgerFormFields.openingBalance,
  })
  .superRefine((values, ctx) => {
    validateLedgerFormValues(values, ctx);
  });

export const editLedgerFormSchema = z.object(ledgerFormFields).superRefine((values, ctx) => {
  validateLedgerFormValues(values, ctx);
});

export type AddLedgerFormValues = z.infer<typeof addLedgerFormSchema>;
export type EditLedgerFormValues = z.infer<typeof editLedgerFormSchema>;

export function parseOpeningBalance(value: string): number | undefined {
  if (value.trim() === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function parseClosingBalance(value: string): number | null | undefined {
  if (value.trim() === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function formValuesToCreatePayload(values: AddLedgerFormValues): CreateLedgerPayload {
  const openingBalance = parseOpeningBalance(values.openingBalance);

  return {
    name: values.name,
    type: values.type as CreateLedgerPayload['type'],
    subType: values.subType,
    category: values.category,
    ...(openingBalance !== undefined ? { openingBalance } : {}),
  };
}

export function formValuesToUpdatePayload(values: EditLedgerFormValues): UpdateLedgerPayload {
  const openingBalance = parseOpeningBalance(values.openingBalance);
  const closingBalance = parseClosingBalance(values.closingBalance);

  return {
    name: values.name,
    type: values.type as UpdateLedgerPayload['type'],
    subType: values.subType,
    category: values.category,
    ...(openingBalance !== undefined ? { openingBalance } : {}),
    closingBalance,
  };
}

export function ledgerToFormValues(ledger: Ledger): EditLedgerFormValues {
  return {
    name: ledger.name,
    type: ledger.type,
    subType: ledger.subType,
    category: ledger.category,
    openingBalance: String(ledger.openingBalance),
    closingBalance: ledger.closingBalance === null ? '' : String(ledger.closingBalance),
  };
}
