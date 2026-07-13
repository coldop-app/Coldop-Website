import type { OutgoingDaybookEntry } from '@/features/daybook/types';
import { resolveFarmerStorageLinkId } from '@/features/daybook/utils/resolve-farmer-storage-link-id';
import type { OutgoingEditFormValues } from '@/features/outgoing/schemas/outgoing-edit-form-schema';
import type { FarmerStorageLink } from '@/features/people/types';

function parseManualGatePassNumber(value: string | number | undefined): number | undefined {
  if (value === undefined || value === '') return undefined;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function normalizeToIsoDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  return date.toISOString();
}

export function outgoingDaybookEntryToEditFormValues(
  entry: OutgoingDaybookEntry,
  allocations: Record<string, number> = {},
  farmerStorageLinks: FarmerStorageLink[] = [],
): OutgoingEditFormValues {
  return {
    farmerStorageLinkId: resolveFarmerStorageLinkId(entry.farmerStorageLinkId, farmerStorageLinks),
    manualGatePassNumber: parseManualGatePassNumber(entry.manualParchiNumber),
    stockFilter: entry.stockFilter?.trim() ?? '',
    date: normalizeToIsoDateTime(entry.date),
    from: entry.from?.trim() ?? '',
    to: entry.to?.trim() ?? '',
    truckNumber: (entry.truckNumber ?? '').trim().toUpperCase(),
    remarks: entry.remarks?.trim() ?? '',
    allocations,
  };
}
