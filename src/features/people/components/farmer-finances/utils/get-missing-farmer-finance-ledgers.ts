import type { Ledger } from '@/features/finances/components/ledger-tab/types';
import {
  DISCOUNT_LEDGER_NAME,
  OTHER_INCOME_LEDGER_NAME,
  POTATO_PURCHASE_LEDGER_NAME,
} from '@/features/people/components/farmer-finances/ledger-names';

type LedgerPair = {
  debitLedger: Ledger | null;
  creditLedger: Ledger | null;
};

function collectMissingLedgers(required: { label: string; ledger: Ledger | null }[]): string[] {
  return required.filter((item) => !item.ledger).map((item) => item.label);
}

export function getMissingBuyPotatoLedgers({ debitLedger, creditLedger }: LedgerPair): string[] {
  return collectMissingLedgers([
    { label: POTATO_PURCHASE_LEDGER_NAME, ledger: debitLedger },
    { label: 'Farmer ledger', ledger: creditLedger },
  ]);
}

export function getMissingSellPotatoLedgers({ debitLedger, creditLedger }: LedgerPair): string[] {
  return collectMissingLedgers([
    { label: 'Farmer ledger', ledger: debitLedger },
    { label: POTATO_PURCHASE_LEDGER_NAME, ledger: creditLedger },
  ]);
}

export function getMissingAddDiscountLedgers({ debitLedger, creditLedger }: LedgerPair): string[] {
  return collectMissingLedgers([
    { label: DISCOUNT_LEDGER_NAME, ledger: debitLedger },
    { label: 'Farmer ledger', ledger: creditLedger },
  ]);
}

export function getMissingAddChargeLedgers({ debitLedger, creditLedger }: LedgerPair): string[] {
  return collectMissingLedgers([
    { label: 'Farmer ledger', ledger: debitLedger },
    { label: OTHER_INCOME_LEDGER_NAME, ledger: creditLedger },
  ]);
}

export function getMissingFarmerPaymentLedgers({
  farmerLedger,
  hasPaymentLedgers,
}: {
  farmerLedger: Ledger | null;
  hasPaymentLedgers: boolean;
}): string[] {
  const missing = collectMissingLedgers([{ label: 'Farmer ledger', ledger: farmerLedger }]);

  if (!hasPaymentLedgers) {
    missing.push('Cash or Bank Accounts ledger');
  }

  return missing;
}
