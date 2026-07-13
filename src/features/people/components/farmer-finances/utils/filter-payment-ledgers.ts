import type { Ledger } from '@/features/finances/components/ledger-tab/types';

const PAYMENT_LEDGER_CATEGORIES = new Set(['Cash', 'Bank Accounts']);

export function isPaymentLedger(ledger: Ledger): boolean {
  return (
    ledger.type === 'Asset' &&
    ledger.subType === 'Current Assets' &&
    PAYMENT_LEDGER_CATEGORIES.has(ledger.category)
  );
}

export function filterPaymentLedgers(ledgers: Ledger[]): Ledger[] {
  return ledgers.filter(isPaymentLedger).sort((left, right) => left.name.localeCompare(right.name));
}
