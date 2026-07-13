import { describe, expect, it } from 'vitest';

import { computeLedgerBalances } from './compute-ledger-balances';
import { buildLedgerStatement } from './build-ledger-statement';
import type { ReportLedger, ReportVoucher } from './types';

const cash: ReportLedger = {
  id: 'cash',
  name: 'Cash',
  type: 'Asset',
  subType: 'Current Assets',
  category: 'Cash',
  openingBalance: 100,
  farmerStorageLinkId: null,
};

const sales: ReportLedger = {
  id: 'sales',
  name: 'Sales',
  type: 'Income',
  subType: 'Operating Income',
  category: 'Sales',
  openingBalance: 0,
  farmerStorageLinkId: null,
};

describe('buildLedgerStatement', () => {
  it('running balance matches computeLedgerBalances', () => {
    const vouchers: ReportVoucher[] = [
      {
        id: 'v1',
        date: '2026-01-05',
        amount: 50,
        narration: '',
        debitLedgerId: 'cash',
        creditLedgerId: 'sales',
        debitLedgerName: 'Cash',
        creditLedgerName: 'Sales',
      },
      {
        id: 'v2',
        date: '2026-01-10',
        amount: 20,
        narration: '',
        debitLedgerId: 'sales',
        creditLedgerId: 'cash',
        debitLedgerName: 'Sales',
        creditLedgerName: 'Cash',
      },
    ];

    const ledgers = [cash, sales];
    const statement = buildLedgerStatement('cash', ledgers, vouchers);
    const balanceMap = computeLedgerBalances(ledgers, vouchers);

    expect(statement).not.toBeNull();
    expect(statement!.closingBalance).toBe(balanceMap.get('cash'));
    expect(statement!.entries.at(-1)?.runningBalance).toBe(balanceMap.get('cash'));
  });
});
