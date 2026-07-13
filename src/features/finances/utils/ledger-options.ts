import type { ComboboxOption } from '@/components/searchable-option-combobox';
import type { Ledger } from '@/features/finances/components/ledger-tab/types';

export function mapLedgersToComboboxOptions(ledgers: Ledger[]): ComboboxOption[] {
  return ledgers
    .map((ledger) => ({
      id: ledger.id,
      label: ledger.name,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
