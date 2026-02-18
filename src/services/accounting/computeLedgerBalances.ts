import type { Ledger } from '@/services/accounting/ledgers/useGetAllLedgers';
import type { Voucher } from '@/services/accounting/vouchers/useGetAllVouchers';

/**
 * Computes closing balance for each ledger from opening balance and vouchers,
 * using the same logic as ledger-view-tab so Dr/Cr and amounts stay consistent.
 * - Asset/Expense: opening + debits - credits (positive = Dr)
 * - Liability/Income/Equity: opening - debits + credits (negative = Dr)
 */
export function computeLedgerBalancesFromVouchers(
  ledgers: Ledger[],
  vouchers: Voucher[]
): Map<string, number> {
  const map = new Map<string, number>();
  for (const ledger of ledgers) {
    const opening = ledger.openingBalance ?? 0;
    let debitTotal = 0;
    let creditTotal = 0;
    for (const v of vouchers) {
      if (v.debitLedger._id === ledger._id) debitTotal += v.amount;
      if (v.creditLedger._id === ledger._id) creditTotal += v.amount;
    }
    const balance = ['Asset', 'Expense'].includes(ledger.type)
      ? opening + debitTotal - creditTotal
      : opening - debitTotal + creditTotal;
    map.set(ledger._id, balance);
  }
  return map;
}
