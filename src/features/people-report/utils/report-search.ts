import type { DaybookEntry } from '@/features/daybook/types';
import { isIncomingDaybookEntry } from '@/features/daybook/types';
import { formatDaybookDate } from '@/features/daybook/utils/format';
import {
  getGatePassTotalBags,
  getGatePassVariety,
} from '@/features/people-report/utils/gate-pass-table-helpers';

export type FarmerReportSearchIndex = {
  entry: DaybookEntry;
  text: string;
};

function buildFarmerReportSearchText(entry: DaybookEntry): string {
  const incomingFields = isIncomingDaybookEntry(entry)
    ? [
        entry.customMarka,
        ...(entry.bagSizes ?? []).flatMap((bag) => [
          bag.name,
          String(bag.currentQuantity),
          String(bag.initialQuantity),
          bag.location?.chamber,
          bag.location?.floor,
          bag.location?.row,
        ]),
      ]
    : [];

  return [
    formatDaybookDate(entry.date || entry.createdAt),
    String(entry.gatePassNo),
    entry.manualParchiNumber,
    getGatePassVariety(entry),
    entry.stockFilter,
    ...incomingFields,
    entry.remarks,
    entry.truckNumber,
    entry.createdBy?.name,
    String(getGatePassTotalBags(entry)),
  ]
    .filter((value) => value != null && value !== '')
    .join('\u0000')
    .toLowerCase();
}

export function createFarmerReportSearchIndex(entries: DaybookEntry[]): FarmerReportSearchIndex[] {
  return entries.map((entry) => ({
    entry,
    text: buildFarmerReportSearchText(entry),
  }));
}

export function filterFarmerReportSearchIndex(
  index: FarmerReportSearchIndex[],
  query: string,
): DaybookEntry[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return index.map((item) => item.entry);

  const matches: DaybookEntry[] = [];

  for (const item of index) {
    if (item.text.includes(normalized)) {
      matches.push(item.entry);
    }
  }

  return matches;
}

export function countFarmerReportSearchMatches(
  index: FarmerReportSearchIndex[],
  query: string,
): number {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return index.length;

  let count = 0;

  for (const item of index) {
    if (item.text.includes(normalized)) count += 1;
  }

  return count;
}
