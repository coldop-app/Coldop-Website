import type { CreateLabourExpensePayload } from '@/features/finances/types';

export type LabourExpensePayloadRow = {
  label: string;
  debitLedgerId?: string;
  total: number;
};

export type LabourExpensePayloadResult =
  | { ok: true; payload: CreateLabourExpensePayload }
  | { ok: false; error: string };

export function roundLabourExpenseAmount(value: number): number {
  return Math.round(value * 100) / 100;
}

export function buildLabourExpenseCreatePayload(input: {
  date: string;
  rows: LabourExpensePayloadRow[];
}): LabourExpensePayloadResult {
  if (!input.date) {
    return { ok: false, error: 'Select a valid date' };
  }

  const debits: CreateLabourExpensePayload['debits'] = [];

  for (const row of input.rows) {
    if (!(row.total > 0)) {
      continue;
    }

    const amount = roundLabourExpenseAmount(row.total);
    if (amount < 0.01) {
      continue;
    }

    const debitLedgerId = row.debitLedgerId?.trim();
    if (!debitLedgerId) {
      return { ok: false, error: `Missing debit ledger for ${row.label}` };
    }

    debits.push({ debitLedgerId, amount });
  }

  if (debits.length === 0) {
    return {
      ok: false,
      error: 'Enter at least one labour expense with a total greater than 0',
    };
  }

  return {
    ok: true,
    payload: {
      date: input.date,
      debits,
    },
  };
}
