import type { ComboboxOption } from '@/components/searchable-option-combobox';
import {
  getCategoriesForTypeSubType,
  getSubTypesForType,
  LEDGER_OPTIONS,
  LEDGER_TYPES,
} from '@/features/finances/shared/chart-of-accounts';
import type { LedgerType } from '@/features/finances/types';

export { LEDGER_TYPES, type LedgerType };

export const TYPE_SUB_TYPE_MAP = LEDGER_OPTIONS;

export function toComboboxOptions(values: readonly string[]): ComboboxOption[] {
  return values.map((value) => ({
    id: value,
    label: value,
  }));
}

export const LEDGER_TYPE_OPTIONS: ComboboxOption[] = LEDGER_TYPES.map((type) => ({
  id: type,
  label: type,
}));

export function getSubTypeOptionsForType(type: string): ComboboxOption[] {
  if (!type) {
    return [];
  }

  return toComboboxOptions(getSubTypesForType(type as LedgerType));
}

export function getCategoryOptionsForTypeSubType(type: string, subType: string): ComboboxOption[] {
  if (!type || !subType) {
    return [];
  }

  return toComboboxOptions(getCategoriesForTypeSubType(type as LedgerType, subType));
}

export function getSubTypesForTypeFromOptions(type: string): string[] {
  if (!type) {
    return [];
  }

  return getSubTypesForType(type as LedgerType);
}

// Backward-compatible alias used by form schema
export { getSubTypesForTypeFromOptions as getSubTypesForType };
