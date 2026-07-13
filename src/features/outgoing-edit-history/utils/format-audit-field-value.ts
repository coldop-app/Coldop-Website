import type { DaybookLocation } from '@/features/daybook/types';
import type {
  OutgoingGatePassAuditOrderDetail,
  OutgoingGatePassAuditState,
} from '@/features/outgoing-edit-history/types';

export type DisplayableOutgoingGatePassAuditField = Exclude<
  keyof OutgoingGatePassAuditState,
  'incomingGatePassSnapshots'
>;

export const OUTGOING_GATE_PASS_AUDIT_FIELD_LABELS: Record<
  DisplayableOutgoingGatePassAuditField,
  string
> = {
  date: 'Date',
  variety: 'Commodity',
  truckNumber: 'Truck number',
  remarks: 'Remarks',
  manualParchiNumber: 'Manual parchi',
  from: 'From',
  to: 'To',
  orderDetails: 'Order details',
};

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-IN').format(value);
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

function formatOrderDetailsSummary(orderDetails: OutgoingGatePassAuditOrderDetail[]) {
  if (orderDetails.length === 0) return '-';

  const totalIssued = orderDetails.reduce((sum, line) => sum + line.quantityIssued, 0);

  return `${orderDetails.length} line${orderDetails.length === 1 ? '' : 's'} · ${formatNumber(totalIssued)} issued`;
}

export function formatAuditFieldValue(
  field: DisplayableOutgoingGatePassAuditField,
  value: unknown,
): string {
  if (value == null || value === '') return '-';

  switch (field) {
    case 'date':
      return typeof value === 'string' ? formatDate(value) : '-';
    case 'orderDetails':
      return Array.isArray(value)
        ? formatOrderDetailsSummary(value as OutgoingGatePassAuditOrderDetail[])
        : '-';
    default:
      return String(value);
  }
}

export function getOutgoingGatePassAuditChangedFields(
  previousState: OutgoingGatePassAuditState | null | undefined,
  modifiedState: OutgoingGatePassAuditState | null | undefined,
): DisplayableOutgoingGatePassAuditField[] {
  const beforeState = previousState ?? {};
  const afterState = modifiedState ?? {};

  const fields = new Set([...Object.keys(beforeState), ...Object.keys(afterState)]) as Set<
    keyof OutgoingGatePassAuditState
  >;

  const snapshotsChanged =
    JSON.stringify(beforeState.incomingGatePassSnapshots ?? []) !==
    JSON.stringify(afterState.incomingGatePassSnapshots ?? []);

  const orderDetailsChanged =
    JSON.stringify(beforeState.orderDetails ?? []) !==
    JSON.stringify(afterState.orderDetails ?? []);

  const changedFields = [...fields].filter((field) => {
    if (field === 'incomingGatePassSnapshots') {
      return false;
    }

    const before = beforeState[field];
    const after = afterState[field];

    if (field === 'orderDetails') {
      return orderDetailsChanged;
    }

    return before !== after;
  }) as DisplayableOutgoingGatePassAuditField[];

  if (snapshotsChanged && !orderDetailsChanged && !changedFields.includes('orderDetails')) {
    changedFields.push('orderDetails');
  }

  return changedFields;
}

export function formatAuditLocation(location: DaybookLocation) {
  return formatLocation(location);
}
