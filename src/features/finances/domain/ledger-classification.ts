import type { LedgerType } from '@/features/finances/types';

import type { ReportLedger } from './types';

export function isDebitNatureType(type: LedgerType): boolean {
  return type === 'Asset' || type === 'Expense';
}

export function isSalesIncome(ledger: Pick<ReportLedger, 'type' | 'category'>): boolean {
  return ledger.type === 'Income' && ledger.category.toLowerCase().includes('sale');
}

export function isTradingPurchase(
  ledger: Pick<ReportLedger, 'type' | 'subType' | 'category'>,
): boolean {
  return (
    ledger.type === 'Expense' &&
    ledger.subType === 'Direct Expenses' &&
    ledger.category === 'Purchases'
  );
}

export function isStockLedger(ledger: Pick<ReportLedger, 'category'>): boolean {
  return ledger.category === 'Stock in Hand';
}

export function isIndirectExpense(
  ledger: Pick<ReportLedger, 'type' | 'subType' | 'category'>,
): boolean {
  return ledger.type === 'Expense' && !isTradingPurchase(ledger);
}

export function isOtherIncome(ledger: Pick<ReportLedger, 'type' | 'category'>): boolean {
  return ledger.type === 'Income' && !isSalesIncome(ledger);
}
