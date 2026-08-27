import { describe, expect, it } from 'vitest';

import { getCategoriesForTypeSubType } from '@/features/finances/shared/chart-of-accounts';

import {
  isDebitNatureType,
  isIndirectExpense,
  isLabourExpenseLedger,
  isSalesIncome,
  isStockLedger,
  isTradingPurchase,
} from './ledger-classification';
import type { ReportLedger } from './types';

const assetLedger: ReportLedger = {
  id: 'a1',
  name: 'Cash',
  type: 'Asset',
  subType: 'Current Assets',
  category: 'Cash',
  openingBalance: 0,
  farmerStorageLinkId: null,
};

describe('ledger-classification', () => {
  it('identifies debit-nature types', () => {
    expect(isDebitNatureType('Asset')).toBe(true);
    expect(isDebitNatureType('Expense')).toBe(true);
    expect(isDebitNatureType('Liability')).toBe(false);
  });

  it('identifies sales income by category', () => {
    expect(isSalesIncome({ type: 'Income', category: 'Sales' })).toBe(true);
    expect(isSalesIncome({ type: 'Income', category: 'Vegetable Sales' })).toBe(true);
    expect(isSalesIncome({ type: 'Income', category: 'Interest Income' })).toBe(false);
  });

  it('identifies trading purchases', () => {
    expect(
      isTradingPurchase({
        type: 'Expense',
        subType: 'Direct Expenses',
        category: 'Purchases',
      }),
    ).toBe(true);
    expect(
      isTradingPurchase({
        type: 'Expense',
        subType: 'Direct Expenses',
        category: 'Freight',
      }),
    ).toBe(false);
  });

  it('identifies stock ledger', () => {
    expect(isStockLedger({ category: 'Stock in Hand' })).toBe(true);
    expect(isStockLedger(assetLedger)).toBe(false);
  });

  it('identifies labour expense ledgers as indirect', () => {
    const labourExpense = {
      type: 'Expense' as const,
      subType: 'Indirect Expenses',
      category: 'Labour expense',
    };

    expect(isLabourExpenseLedger(labourExpense)).toBe(true);
    expect(isIndirectExpense(labourExpense)).toBe(true);
    expect(isTradingPurchase(labourExpense)).toBe(false);
    expect(
      isLabourExpenseLedger({
        type: 'Expense',
        subType: 'Direct Expenses',
        category: 'Purchases',
      }),
    ).toBe(false);
    expect(getCategoriesForTypeSubType('Expense', 'Indirect Expenses')).toContain('Labour expense');
  });
});
