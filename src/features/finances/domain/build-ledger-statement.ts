import { isDebitNatureType } from './ledger-classification';
import { applyEntryToBalance } from './compute-ledger-balances';
import type { LedgerStatementReport, ReportLedger, ReportVoucher } from './types';

export function buildLedgerStatement(
  ledgerId: string,
  ledgers: ReportLedger[],
  vouchers: ReportVoucher[],
): LedgerStatementReport | null {
  const ledger = ledgers.find((item) => item.id === ledgerId);
  if (!ledger) {
    return null;
  }

  const debitEntries: Array<{
    date: string;
    amount: number;
    narration: string;
    counterpartyName: string;
    isDebit: true;
    entryType: 'D';
  }> = [];
  const creditEntries: Array<{
    date: string;
    amount: number;
    narration: string;
    counterpartyName: string;
    isDebit: false;
    entryType: 'C';
  }> = [];

  for (const voucher of vouchers) {
    if (voucher.debitLedgerId === ledgerId) {
      debitEntries.push({
        date: voucher.date,
        amount: voucher.amount,
        narration: voucher.narration,
        counterpartyName: voucher.creditLedgerName,
        isDebit: true,
        entryType: 'D',
      });
    }
    if (voucher.creditLedgerId === ledgerId) {
      creditEntries.push({
        date: voucher.date,
        amount: voucher.amount,
        narration: voucher.narration,
        counterpartyName: voucher.debitLedgerName,
        isDebit: false,
        entryType: 'C',
      });
    }
  }

  const allEntries = [...debitEntries, ...creditEntries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const openingBalance = ledger.openingBalance ?? 0;
  let running = openingBalance;

  const entries = allEntries.map((entry, index) => {
    running = applyEntryToBalance(ledger.type, running, entry.amount, entry.isDebit);
    return {
      id: `${entry.date}-${entry.entryType}-${index}`,
      date: entry.date,
      amount: entry.amount,
      narration: entry.narration,
      counterpartyName: entry.counterpartyName,
      isDebit: entry.isDebit,
      entryType: entry.entryType,
      runningBalance: running,
    };
  });

  const closingBalance =
    entries.length > 0 ? entries[entries.length - 1]!.runningBalance : openingBalance;
  const isDebitBalance = isDebitNatureType(ledger.type) ? closingBalance >= 0 : closingBalance < 0;

  return {
    ledger,
    openingBalance,
    hasOpeningBalance: openingBalance !== 0,
    entries,
    closingBalance,
    isDebitBalance,
    hasNoData: allEntries.length === 0 && openingBalance === 0,
  };
}
