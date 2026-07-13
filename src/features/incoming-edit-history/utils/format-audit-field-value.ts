import type { DaybookLocation, IncomingBagSize } from '@/features/daybook/types';
import type { IncomingGatePassAuditState } from '@/features/incoming-edit-history/types';

export const INCOMING_GATE_PASS_AUDIT_FIELD_LABELS: Record<
  keyof IncomingGatePassAuditState,
  string
> = {
  date: 'Date',
  variety: 'Commodity',
  truckNumber: 'Truck number',
  remarks: 'Remarks',
  manualParchiNumber: 'Manual parchi',
  stockFilter: 'Stock filter',
  customMarka: 'Marka',
  amount: 'Amount',
  bagSizes: 'Bag quantities',
};

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-IN').format(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(value);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatLocation(location: DaybookLocation) {
  const parts = [location.chamber, location.floor, location.row].filter(Boolean);
  return parts.length > 0 ? parts.join(' / ') : '-';
}

function formatBagSizesSummary(bagSizes: IncomingBagSize[]) {
  if (bagSizes.length === 0) return '-';

  const total = bagSizes.reduce((sum, slot) => sum + slot.currentQuantity, 0);

  return `${bagSizes.length} size${bagSizes.length === 1 ? '' : 's'} · ${formatNumber(total)} bags`;
}

export function formatAuditFieldValue(
  field: keyof IncomingGatePassAuditState,
  value: unknown,
): string {
  if (value == null || value === '') return '-';

  switch (field) {
    case 'date':
      return typeof value === 'string' ? formatDate(value) : '-';
    case 'amount':
      return typeof value === 'number' ? formatCurrency(value) : '-';
    case 'bagSizes':
      return Array.isArray(value) ? formatBagSizesSummary(value as IncomingBagSize[]) : '-';
    default:
      return String(value);
  }
}

export function getIncomingGatePassAuditChangedFields(
  previousState: IncomingGatePassAuditState | null | undefined,
  modifiedState: IncomingGatePassAuditState | null | undefined,
): Array<keyof IncomingGatePassAuditState> {
  const beforeState = previousState ?? {};
  const afterState = modifiedState ?? {};

  const fields = new Set([...Object.keys(beforeState), ...Object.keys(afterState)]) as Set<
    keyof IncomingGatePassAuditState
  >;

  return [...fields].filter((field) => {
    const before = beforeState[field];
    const after = afterState[field];

    if (field === 'bagSizes') {
      return JSON.stringify(before ?? []) !== JSON.stringify(after ?? []);
    }

    return before !== after;
  });
}

export function formatAuditLocation(location: DaybookLocation) {
  return formatLocation(location);
}
