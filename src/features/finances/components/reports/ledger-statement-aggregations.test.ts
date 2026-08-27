import { describe, expect, it } from 'vitest';

import type { LedgerStatementEntry } from '@/features/finances/domain/types';

import {
  lastLedgerStatementRunningBalance,
  sumLedgerStatementCredits,
  sumLedgerStatementDebits,
} from './ledger-statement-aggregations';

const sameDayEntries: LedgerStatementEntry[] = [
  {
    id: '1',
    date: '2026-08-27T00:00:00.000Z',
    amount: 350,
    narration: 'Bags stored',
    counterpartyName: 'Labour Thekedar',
    isDebit: true,
    entryType: 'D',
    runningBalance: 350,
  },
  {
    id: '2',
    date: '2026-08-27T00:00:00.000Z',
    amount: 120,
    narration: 'Payment',
    counterpartyName: 'Cash',
    isDebit: false,
    entryType: 'C',
    runningBalance: 230,
  },
  {
    id: '3',
    date: '2026-08-27T00:00:00.000Z',
    amount: 50,
    narration: 'Extra labour',
    counterpartyName: 'Labour Thekedar',
    isDebit: true,
    entryType: 'D',
    runningBalance: 280,
  },
];

describe('ledger statement date aggregations', () => {
  it('sums debit amounts for the day', () => {
    expect(sumLedgerStatementDebits(sameDayEntries)).toBe(400);
  });

  it('sums credit amounts for the day', () => {
    expect(sumLedgerStatementCredits(sameDayEntries)).toBe(120);
  });

  it('uses the last running balance as the end-of-day total, not a sum', () => {
    expect(lastLedgerStatementRunningBalance(sameDayEntries)).toBe(280);
    expect(lastLedgerStatementRunningBalance(sameDayEntries)).not.toBe(
      sameDayEntries.reduce((sum, entry) => sum + entry.runningBalance, 0),
    );
  });
});
