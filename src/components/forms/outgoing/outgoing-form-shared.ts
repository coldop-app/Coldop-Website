import * as z from 'zod';
import { formatDate, payloadDateSchema } from '@/lib/helpers';
import type { DaybookEntry } from '@/services/store-admin/functions/useGetDaybook';

/** API may return manual parchi as number; form always uses string. */
export function manualParchiNumberToString(value: unknown): string {
  if (value == null || value === '') return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(Math.trunc(value));
  }
  return String(value).trim();
}

export const defaultOutgoingFormValues = {
  manualParchiNumber: '',
  farmerStorageLinkId: '',
  orderDate: formatDate(new Date()),
  from: '',
  to: '',
  truckNumber: '',
  remarks: '',
};

export type OutgoingFormValuesState = typeof defaultOutgoingFormValues;

export const outgoingFormSchema = z.object({
  manualParchiNumber: z
    .string()
    .trim()
    .optional()
    .refine(
      (v) =>
        v === undefined ||
        v === '' ||
        (/^\d+$/.test(v) && Number.parseInt(v, 10) > 0),
      'Manual parchi number must be a positive integer'
    ),
  farmerStorageLinkId: z.string().min(1, 'Please select a farmer'),
  orderDate: payloadDateSchema,
  from: z.string().trim().optional(),
  to: z.string().trim().optional(),
  truckNumber: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val ? val.toUpperCase() : val)),
  remarks: z.string().max(500).default(''),
});

export function getOutgoingFormValuesFromEntry(
  entry: DaybookEntry
): OutgoingFormValuesState {
  const orderDate =
    entry.date != null && entry.date !== ''
      ? formatDate(new Date(entry.date))
      : formatDate(new Date());
  return {
    manualParchiNumber: manualParchiNumberToString(entry.manualParchiNumber),
    farmerStorageLinkId: entry.farmerStorageLinkId?._id ?? '',
    orderDate,
    from: entry.from ?? '',
    to: entry.to ?? '',
    truckNumber: entry.truckNumber ?? '',
    remarks: entry.remarks ?? '',
  };
}

/** Unique varieties from entry snapshots / incoming entries (for edit variety pre-filter). */
export function getVarietiesFromEntry(entry: DaybookEntry): string[] {
  const names = new Set<string>();
  for (const snap of entry.incomingGatePassSnapshots ?? []) {
    const v = snap.variety?.trim();
    if (v) names.add(v);
  }
  for (const ent of entry.incomingGatePassEntries ?? []) {
    const v = ent.variety?.trim();
    if (v) names.add(v);
  }
  return [...names].sort();
}
