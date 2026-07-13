import type { Preferences } from '@/features/auth/types';
import type { DaybookLocation, IncomingDaybookEntry } from '@/features/daybook/types';

export function formatDaybookDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatDaybookDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatLocation(location: DaybookLocation): string {
  return `Chamber ${location.chamber} / Floor ${location.floor} / Row ${location.row}`;
}

export function formatCompactLocation(location: DaybookLocation): string {
  return `${location.chamber}/${location.floor}/${location.row}`;
}

export function formatManualParchi(value: string | number | null | undefined): string {
  if (value == null || value === '') return '—';
  return String(value);
}

export function sumBagQuantities<T extends Record<string, unknown>>(
  bags: T[] | null | undefined,
  field: keyof T,
): number {
  return (bags ?? []).reduce((total, bag) => {
    const value = bag[field];
    return total + (typeof value === 'number' ? value : 0);
  }, 0);
}

export function locationKey(location: DaybookLocation): string {
  return `${location.chamber}\u001f${location.floor}\u001f${location.row}`;
}

export function formatQuantity(value: number): string {
  return value.toLocaleString('en-IN');
}

type LotNoSource = {
  gatePassNo: number;
  accountNumber: number;
  customMarka?: string | null;
};

export function formatLotNo(
  source: LotNoSource,
  preferences: Pick<Preferences, 'customMarka' | 'markaType'> | null | undefined,
  totalBags: number,
): string {
  if (preferences?.customMarka) {
    const custom = source.customMarka?.trim();
    return custom || '—';
  }

  const identifier =
    preferences?.markaType === 'AccountNumber' ? source.accountNumber : source.gatePassNo;

  return `${identifier}/${totalBags}`;
}

export function formatIncomingLotNo(
  entry: IncomingDaybookEntry,
  preferences: Pick<Preferences, 'customMarka' | 'markaType'> | null | undefined,
  totalBags: number,
): string {
  return formatLotNo(
    {
      gatePassNo: entry.gatePassNo,
      accountNumber: entry.farmerStorageLinkId.accountNumber,
      customMarka: entry.customMarka,
    },
    preferences,
    totalBags,
  );
}

export function formatStorageGatePassLotNo(
  pass: LotNoSource,
  preferences: Pick<Preferences, 'customMarka' | 'markaType'> | null | undefined,
  totalBags: number,
): string {
  return formatLotNo(pass, preferences, totalBags);
}
