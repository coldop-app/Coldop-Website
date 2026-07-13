import type { Ledger } from '@/features/finances/components/ledger-tab/types';
import type { LedgerApiRecord } from '@/features/finances/types';

export function mapLedgerToRow(ledger: LedgerApiRecord): Ledger {
  return {
    id: ledger._id,
    name: ledger.name,
    type: ledger.type,
    subType: ledger.subType,
    category: ledger.category,
    openingBalance: ledger.openingBalance,
    balance: ledger.balance,
    closingBalance: ledger.closingBalance,
    kind: ledger.isSystemLedger ? 'System' : 'Custom',
    transactionCount: ledger.transactionCount,
    createdAt: ledger.createdAt,
  };
}
