import { describe, expect, it } from 'vitest';

import { buildBalanceSheetReport } from './build-balance-sheet';
import { buildClosingBalancesReport } from './build-closing-balances';
import type { ReportLedger, ReportVoucher } from './types';

const cash: ReportLedger = {
  id: 'cash',
  name: 'Cash',
  type: 'Asset',
  subType: 'Current Assets',
  category: 'Cash',
  openingBalance: 0,
  farmerStorageLinkId: null,
};

const capital: ReportLedger = {
  id: 'capital',
  name: 'Owner Capital',
  type: 'Equity',
  subType: 'Capital',
  category: 'Owner Capital',
  openingBalance: 1000,
  farmerStorageLinkId: null,
};

describe('buildBalanceSheetReport', () => {
  it('matches closing balances totals for the same inputs', () => {
    const ledgers = [cash, capital];
    const vouchers: ReportVoucher[] = [
      {
        id: 'v1',
        date: '2026-01-05',
        amount: 1000,
        narration: 'Intro',
        debitLedgerId: 'cash',
        creditLedgerId: 'capital',
        debitLedgerName: 'Cash',
        creditLedgerName: 'Owner Capital',
      },
    ];

    const balanceSheet = buildBalanceSheetReport(ledgers, vouchers);
    const closingBalances = buildClosingBalancesReport(ledgers, vouchers);

    expect(balanceSheet).not.toBeNull();
    expect(closingBalances).not.toBeNull();
    expect(balanceSheet!.totalAssets).toBe(closingBalances!.totalAssets);
    expect(balanceSheet!.totalLiabilitiesAndEquity).toBe(
      closingBalances!.totalLiabilitiesAndEquity,
    );
    expect(balanceSheet!.isBalanced).toBe(closingBalances!.isBalanced);
  });
});
