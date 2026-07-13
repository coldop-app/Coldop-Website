import { isDebitNatureType } from './ledger-classification';
import type { ReportLedger, ReportVoucher } from './types';

/**
 * Computes closing balance for each ledger from opening balance and vouchers.
 * Asset/Expense: opening + debits - credits (positive = Dr)
 * Liability/Income/Equity: opening - debits + credits (negative = Dr)
 */
export function computeLedgerBalances(
  ledgers: ReportLedger[],
  vouchers: ReportVoucher[],
): Map<string, number> {
  const map = new Map<string, number>();

  for (const ledger of ledgers) {
    const opening = ledger.openingBalance ?? 0;
    let debitTotal = 0;
    let creditTotal = 0;

    for (const voucher of vouchers) {
      if (voucher.debitLedgerId === ledger.id) {
        debitTotal += voucher.amount;
      }
      if (voucher.creditLedgerId === ledger.id) {
        creditTotal += voucher.amount;
      }
    }

    const balance = isDebitNatureType(ledger.type)
      ? opening + debitTotal - creditTotal
      : opening - debitTotal + creditTotal;

    map.set(ledger.id, balance);
  }

  return map;
}

export function applyEntryToBalance(
  ledgerType: ReportLedger['type'],
  running: number,
  amount: number,
  isDebit: boolean,
): number {
  if (isDebit) {
    return isDebitNatureType(ledgerType) ? running + amount : running - amount;
  }

  return isDebitNatureType(ledgerType) ? running - amount : running + amount;
}
