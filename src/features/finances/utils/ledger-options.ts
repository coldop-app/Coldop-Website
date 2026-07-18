import type { ComboboxOption } from '@/components/searchable-option-combobox';
import type { Ledger } from '@/features/finances/components/ledger-tab/types';

export function isCashOrBankLedger(ledger: Pick<Ledger, 'category'>) {
  const category = (ledger.category ?? '').toLowerCase();
  return category === 'cash' || category.includes('bank');
}

export function mapLedgersToComboboxOptions(ledgers: Ledger[]): ComboboxOption[] {
  return ledgers
    .map((ledger) => ({
      id: ledger.id,
      label: ledger.name,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
