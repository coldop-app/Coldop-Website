import { describe, expect, it } from 'vitest';

import { computeLedgerBalances } from './compute-ledger-balances';
import { computeNetProfitLoss } from './compute-net-profit-loss';
import type { ReportLedger, ReportVoucher } from './types';

const stock: ReportLedger = {
  id: 'stock',
  name: 'Stock',
  type: 'Asset',
  subType: 'Current Assets',
  category: 'Stock in Hand',
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

const purchases: ReportLedger = {
  id: 'purchases',
  name: 'Purchases',
  type: 'Expense',
  subType: 'Direct Expenses',
  category: 'Purchases',
  openingBalance: 0,
  farmerStorageLinkId: null,
};

const salary: ReportLedger = {
  id: 'salary',
  name: 'Salary',
  type: 'Expense',
  subType: 'Indirect Expenses',
  category: 'Salary',
  openingBalance: 0,
  farmerStorageLinkId: null,
};

describe('computeNetProfitLoss', () => {
  it('computes profit with stock, sales, and purchases', () => {
    const cash: ReportLedger = {
      id: 'cash',
      name: 'Cash',
      type: 'Asset',
      subType: 'Current Assets',
      category: 'Cash',
      openingBalance: 0,
      farmerStorageLinkId: null,
    };

    const vouchers: ReportVoucher[] = [
      {
        id: 'v1',
        date: '2026-01-10',
        amount: 50,
        narration: '',
        debitLedgerId: 'purchases',
        creditLedgerId: 'cash',
        debitLedgerName: 'Purchases',
        creditLedgerName: 'Cash',
      },
      {
        id: 'v2',
        date: '2026-01-15',
        amount: 500,
        narration: '',
        debitLedgerId: 'cash',
        creditLedgerId: 'sales',
        debitLedgerName: 'Cash',
        creditLedgerName: 'Sales',
      },
    ];

    const ledgers = [stock, sales, purchases, cash];
    const balanceMap = computeLedgerBalances(ledgers, vouchers);
    const result = computeNetProfitLoss(ledgers, balanceMap);

    expect(result.openingStock).toBe(100);
    expect(result.closingStock).toBe(100);
    expect(result.salesTotal).toBe(500);
    expect(result.purchaseTotal).toBe(50);
    expect(result.grossProfit).toBe(450);
    expect(result.netProfitLoss).toBe(450);
  });

  it('handles missing stock ledger', () => {
    const ledgers = [sales, purchases];
    const balanceMap = computeLedgerBalances(ledgers, []);
    const result = computeNetProfitLoss(ledgers, balanceMap);

    expect(result.openingStock).toBe(0);
    expect(result.closingStock).toBe(0);
  });

  it('subtracts indirect expenses from gross profit', () => {
    const cash: ReportLedger = {
      id: 'cash',
      name: 'Cash',
      type: 'Asset',
      subType: 'Current Assets',
      category: 'Cash',
      openingBalance: 0,
      farmerStorageLinkId: null,
    };

    const vouchers: ReportVoucher[] = [
      {
        id: 'v1',
        date: '2026-01-10',
        amount: 1000,
        narration: '',
        debitLedgerId: 'cash',
        creditLedgerId: 'sales',
        debitLedgerName: 'Cash',
        creditLedgerName: 'Sales',
      },
      {
        id: 'v2',
        date: '2026-01-11',
        amount: 200,
        narration: '',
        debitLedgerId: 'salary',
        creditLedgerId: 'cash',
        debitLedgerName: 'Salary',
        creditLedgerName: 'Cash',
      },
    ];

    const ledgers = [cash, sales, salary];
    const balanceMap = computeLedgerBalances(ledgers, vouchers);
    const result = computeNetProfitLoss(ledgers, balanceMap);

    expect(result.grossProfit).toBe(1000);
    expect(result.indirectExpensesTotal).toBe(200);
    expect(result.netProfitLoss).toBe(800);
  });
});
