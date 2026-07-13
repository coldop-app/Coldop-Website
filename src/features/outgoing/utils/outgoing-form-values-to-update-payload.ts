import type { OutgoingEditFormValues } from '@/features/outgoing/schemas/outgoing-edit-form-schema';
import type { UpdateOutgoingGatePassPayload } from '@/features/outgoing/types/api';
import type {
  StorageGatePass,
  TransferStockItem,
} from '@/features/transfer-stock/types/storage-gate-pass';
import { groupItemsIntoIncomingGatePasses } from '@/features/outgoing/utils/outgoing-form-values-to-create-payload';
import { normalizeUppercase } from '@/lib/form-utils';

function normalizeIsoDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString();
}

function formatManualParchiNumber(value: number | undefined): number | undefined {
  return value != null ? value : undefined;
}

function allocationsEqual(a: Record<string, number>, b: Record<string, number>): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) {
    if ((a[key] ?? 0) !== (b[key] ?? 0)) return false;
  }
  return true;
}

export function buildUpdateOutgoingGatePassPayload(
  current: OutgoingEditFormValues,
  baseline: OutgoingEditFormValues,
  items: TransferStockItem[],
  passes: StorageGatePass[],
): UpdateOutgoingGatePassPayload | null {
  const payload: UpdateOutgoingGatePassPayload = {};

  if (normalizeIsoDateTime(current.date) !== normalizeIsoDateTime(baseline.date)) {
    payload.date = current.date;
  }

  const currentManual = formatManualParchiNumber(current.manualGatePassNumber);
  const baselineManual = formatManualParchiNumber(baseline.manualGatePassNumber);
  if (currentManual !== baselineManual) {
    payload.manualParchiNumber = currentManual;
  }

  if (current.from.trim() !== baseline.from.trim()) {
    payload.from = current.from.trim();
  }

  if (current.to.trim() !== baseline.to.trim()) {
    payload.to = current.to.trim();
  }

  if (current.truckNumber.trim() !== baseline.truckNumber.trim()) {
    payload.truckNumber = normalizeUppercase(current.truckNumber.trim());
  }

  if (current.remarks.trim() !== baseline.remarks.trim()) {
    payload.remarks = current.remarks.trim();
  }

  if (current.stockFilter.trim() !== baseline.stockFilter.trim()) {
    payload.stockFilter = current.stockFilter.trim();
  }

  if (!allocationsEqual(current.allocations, baseline.allocations)) {
    payload.incomingGatePasses = groupItemsIntoIncomingGatePasses(items, passes);
  }

  return Object.keys(payload).length > 0 ? payload : null;
}
