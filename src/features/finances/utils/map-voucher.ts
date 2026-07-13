import type { Voucher } from '@/features/finances/components/voucher-tab/types';
import type { VoucherApiRecord, VoucherLedgerRef } from '@/features/finances/types';

function mapLedgerRef(ledger: VoucherLedgerRef | string | null | undefined): {
  id: string;
  name: string;
} {
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

export function mapVoucherToRow(voucher: VoucherApiRecord): Voucher {
  const debitLedger = mapLedgerRef(voucher.debitLedger);
  const creditLedger = mapLedgerRef(voucher.creditLedger);

  return {
    id: voucher._id,
    voucherNo: String(voucher.voucherNumber ?? ''),
    date: voucher.date,
    debit: debitLedger.name,
    credit: creditLedger.name,
    debitLedgerId: debitLedger.id,
    creditLedgerId: creditLedger.id,
    amount: voucher.amount ?? 0,
    narration: voucher.narration ?? '',
  };
}
