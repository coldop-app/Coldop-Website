import type { AggregationFn } from '@tanstack/react-table';

import type { LedgerStatementEntry } from '@/features/finances/domain/types';

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

export function formatLedgerStatementDate(date: string | Date): string {
  return dateFormatter.format(date instanceof Date ? date : new Date(date));
}

export function sumLedgerStatementDebits(
  entries: Pick<LedgerStatementEntry, 'amount' | 'isDebit'>[],
): number {
  return entries.reduce((sum, entry) => (entry.isDebit ? sum + entry.amount : sum), 0);
}

export function sumLedgerStatementCredits(
  entries: Pick<LedgerStatementEntry, 'amount' | 'isDebit'>[],
): number {
  return entries.reduce((sum, entry) => (entry.isDebit ? sum : sum + entry.amount), 0);
}

export function lastLedgerStatementRunningBalance(
  entries: Pick<LedgerStatementEntry, 'runningBalance'>[],
): number {
  return entries.at(-1)?.runningBalance ?? 0;
}

export const ledgerStatementDebitAggregation: AggregationFn<LedgerStatementEntry> = (
  _columnId,
  leafRows,
) => sumLedgerStatementDebits(leafRows.map((row) => row.original));

export const ledgerStatementCreditAggregation: AggregationFn<LedgerStatementEntry> = (
  _columnId,
  leafRows,
) => sumLedgerStatementCredits(leafRows.map((row) => row.original));

export const ledgerStatementBalanceAggregation: AggregationFn<LedgerStatementEntry> = (
  _columnId,
  leafRows,
) => lastLedgerStatementRunningBalance(leafRows.map((row) => row.original));
