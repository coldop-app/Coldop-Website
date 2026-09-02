import { constructAggregationFn } from '@tanstack/react-table';

import type { LedgerStatementEntry } from '@/features/finances/domain/types';
import type { AppTableFeatures } from '@/lib/table/features';

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

/**
 * These aggregations read `row.original`, so they must receive *leaf* rows.
 * Columns using them set `maxAggregationDepth: Infinity` to preserve the v8
 * leaf-row semantics (v9 defaults to direct child rows only).
 */
export const ledgerStatementDebitAggregation = constructAggregationFn<
  AppTableFeatures,
  LedgerStatementEntry
>({
  aggregate: ({ rows }) => sumLedgerStatementDebits(rows.map((row) => row.original)),
});

export const ledgerStatementCreditAggregation = constructAggregationFn<
  AppTableFeatures,
  LedgerStatementEntry
>({
  aggregate: ({ rows }) => sumLedgerStatementCredits(rows.map((row) => row.original)),
});

export const ledgerStatementBalanceAggregation = constructAggregationFn<
  AppTableFeatures,
  LedgerStatementEntry
>({
  aggregate: ({ rows }) => lastLedgerStatementRunningBalance(rows.map((row) => row.original)),
});

export const ledgerStatementEmptyAggregation = constructAggregationFn({ aggregate: () => '' });
