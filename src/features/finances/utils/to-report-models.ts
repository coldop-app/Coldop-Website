import type {
  LedgerApiRecord,
  VoucherApiRecord,
  VoucherLedgerField,
} from '@/features/finances/types';
import type { ReportLedger, ReportVoucher } from '@/features/finances/domain/types';

function mapLedgerRef(ledger: VoucherLedgerField | null | undefined): { id: string; name: string } {
  if (!ledger) {
    return { id: '', name: '' };
  }

  if (typeof ledger === 'string') {
    return { id: ledger, name: '' };
  }

  return {
    id: ledger._id ?? '',
    name: ledger.name ?? '',
  };
}

export function toReportLedger(ledger: LedgerApiRecord): ReportLedger {
  return {
    id: ledger._id,
    name: ledger.name,
    type: ledger.type,
    subType: ledger.subType,
    category: ledger.category,
    openingBalance: ledger.openingBalance ?? 0,
    farmerStorageLinkId: ledger.farmerStorageLinkId,
  };
}

export function toReportVoucher(voucher: VoucherApiRecord): ReportVoucher {
  const debitLedger = mapLedgerRef(voucher.debitLedger);
  const creditLedger = mapLedgerRef(voucher.creditLedger);

  return {
    id: voucher._id,
    date: voucher.date,
    amount: voucher.amount ?? 0,
    narration: voucher.narration ?? '',
    debitLedgerId: debitLedger.id,
    creditLedgerId: creditLedger.id,
    debitLedgerName: debitLedger.name,
    creditLedgerName: creditLedger.name,
  };
}

export function toReportLedgers(ledgers: LedgerApiRecord[]): ReportLedger[] {
  return ledgers.map(toReportLedger);
}

export function toReportVouchers(vouchers: VoucherApiRecord[]): ReportVoucher[] {
  return vouchers.map(toReportVoucher);
}
