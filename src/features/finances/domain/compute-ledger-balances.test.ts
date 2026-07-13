import { describe, expect, it } from 'vitest';

import { computeLedgerBalances } from './compute-ledger-balances';
import type { ReportLedger, ReportVoucher } from './types';

const cash: ReportLedger = {
  id: 'cash',
  name: 'Cash',
  type: 'Asset',
  subType: 'Current Assets',
  category: 'Cash',
  openingBalance: 1000,
  farmerStorageLinkId: null,
};

const creditor: ReportLedger = {
  id: 'creditor',
  name: 'Supplier',
  type: 'Liability',
  subType: 'Current Liabilities',
  category: 'Creditors',
  openingBalance: 500,
  farmerStorageLinkId: null,
};

describe('computeLedgerBalances', () => {
  it('applies asset debit-nature rules', () => {
    const vouchers: ReportVoucher[] = [
      {
        id: 'v1',
        date: '2026-01-05',
        amount: 200,
        narration: '',
        debitLedgerId: 'cash',
        creditLedgerId: 'creditor',
        debitLedgerName: 'Cash',
        creditLedgerName: 'Supplier',
      },
    ];

    const balances = computeLedgerBalances([cash, creditor], vouchers);
    expect(balances.get('cash')).toBe(1200);
    expect(balances.get('creditor')).toBe(700);
  });
});
