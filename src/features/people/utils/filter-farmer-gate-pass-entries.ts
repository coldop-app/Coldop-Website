import type { DaybookSearchBy, DaybookType } from '@/features/daybook/search';
import type { DaybookEntry } from '@/features/daybook/types';
import { isIncomingDaybookEntry, isOutgoingDaybookEntry } from '@/features/daybook/types';

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

function matchesGatePassNumber(entry: DaybookEntry, query: string): boolean {
  return String(entry.gatePassNo).includes(query.trim());
}

function matchesManualParchi(entry: DaybookEntry, query: string): boolean {
  const value = entry.manualParchiNumber;
  if (value === undefined || value === '') return false;

  return String(value).toLowerCase().includes(normalizeQuery(query));
}

function matchesMarka(entry: DaybookEntry, query: string): boolean {
  if (!isIncomingDaybookEntry(entry)) return false;

  const normalizedQuery = normalizeQuery(query);
  const customMarka = entry.customMarka?.trim();

  if (customMarka && customMarka.toLowerCase().includes(normalizedQuery)) {
    return true;
  }

  return String(entry.gatePassNo).includes(query.trim());
}

function matchesRemarks(entry: DaybookEntry, query: string): boolean {
  const remarks = entry.remarks?.trim();
  if (!remarks) return false;

  return remarks.toLowerCase().includes(normalizeQuery(query));
}

export function filterFarmerGatePassEntriesByType(
  entries: DaybookEntry[],
  type: DaybookType,
): DaybookEntry[] {
  if (type === 'all') return entries;
  if (type === 'incoming') return entries.filter(isIncomingDaybookEntry);
  return entries.filter(isOutgoingDaybookEntry);
}

export function filterFarmerGatePassEntries(
  entries: DaybookEntry[],
  query: string,
  searchBy: DaybookSearchBy,
): DaybookEntry[] {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return entries;

  return entries.filter((entry) => {
    switch (searchBy) {
      case 'gatePassNumber':
        return matchesGatePassNumber(entry, trimmedQuery);
      case 'manualParchiNumber':
        return matchesManualParchi(entry, trimmedQuery);
      case 'marka':
        return matchesMarka(entry, trimmedQuery);
      case 'remarks':
        return matchesRemarks(entry, trimmedQuery);
      default:
        return false;
    }
  });
}
