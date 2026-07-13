import { z } from 'zod';

import type {
  DaybookEntry,
  IncomingDaybookEntry,
  OutgoingDaybookEntry,
} from '@/features/daybook/types';

export const daybookTypeSchema = z.enum(['all', 'incoming', 'outgoing']);
export const daybookSortBySchema = z.enum(['latest', 'oldest']);
export const daybookSearchBySchema = z.enum([
  'gatePassNumber',
  'manualParchiNumber',
  'marka',
  'remarks',
]);

export type DaybookType = z.infer<typeof daybookTypeSchema>;
export type DaybookSortBy = z.infer<typeof daybookSortBySchema>;
export type DaybookSearchBy = z.infer<typeof daybookSearchBySchema>;

export type DaybookSearch = {
  type: DaybookType;
  sortBy: DaybookSortBy;
  page: number;
  limit: number;
  receiptNumber?: string;
  searchBy: DaybookSearchBy;
};

export const DAYBOOK_PAGE_SIZE_OPTIONS = [10, 50, 100] as const;

export const DEFAULT_DAYBOOK_SEARCH: DaybookSearch = {
  type: 'all',
  sortBy: 'latest',
  page: 1,
  limit: DAYBOOK_PAGE_SIZE_OPTIONS[0],
  searchBy: 'gatePassNumber',
};

const SEARCH_PLACEHOLDERS: Record<DaybookSearchBy, string> = {
  gatePassNumber: 'Enter gate pass number',
  manualParchiNumber: 'Enter manual parchi number',
  marka: 'Enter marka, e.g. 42/300',
  remarks: 'Search in remarks',
};

export const DAYBOOK_SEARCH_BY_OPTIONS: {
  value: DaybookSearchBy;
  label: string;
}[] = [
  { value: 'gatePassNumber', label: 'Gate Pass No' },
  { value: 'manualParchiNumber', label: 'Manual Parchi' },
  { value: 'marka', label: 'Marka' },
  { value: 'remarks', label: 'Remarks' },
];

export function getSearchPlaceholder(searchBy: DaybookSearchBy): string {
  return SEARCH_PLACEHOLDERS[searchBy];
}

function parseReceiptNumber(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseDaybookPageSize(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number(value);

  if (
    Number.isFinite(parsed) &&
    DAYBOOK_PAGE_SIZE_OPTIONS.includes(parsed as (typeof DAYBOOK_PAGE_SIZE_OPTIONS)[number])
  ) {
    return parsed;
  }

  return DEFAULT_DAYBOOK_SEARCH.limit;
}

function parsePositiveInt(value: unknown, fallback: number, max?: number): number {
  const parsed = typeof value === 'number' ? value : Number(value);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  const floored = Math.floor(parsed);
  return max !== undefined ? Math.min(floored, max) : floored;
}

function getEntryTimestamp(entry: DaybookEntry): number {
  const value = entry.createdAt || entry.date;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function buildSearchEntries(
  incoming: IncomingDaybookEntry[],
  outgoing: OutgoingDaybookEntry[],
  { type, sortBy }: Pick<DaybookSearch, 'type' | 'sortBy'>,
): DaybookEntry[] {
  const entries: DaybookEntry[] = [];

  if (type === 'all' || type === 'incoming') {
    entries.push(...incoming);
  }

  if (type === 'all' || type === 'outgoing') {
    entries.push(...outgoing);
  }

  if (entries.length <= 1) {
    return entries;
  }

  const direction = sortBy === 'latest' ? -1 : 1;

  return entries.sort((a, b) => direction * (getEntryTimestamp(a) - getEntryTimestamp(b)));
}

export function parseDaybookSearch(search: Record<string, unknown>): DaybookSearch {
  const typeResult = daybookTypeSchema.safeParse(search.type);
  const sortByResult = daybookSortBySchema.safeParse(search.sortBy);
  const searchByResult = daybookSearchBySchema.safeParse(search.searchBy);

  return {
    type: typeResult.success ? typeResult.data : DEFAULT_DAYBOOK_SEARCH.type,
    sortBy: sortByResult.success ? sortByResult.data : DEFAULT_DAYBOOK_SEARCH.sortBy,
    page: parsePositiveInt(search.page, DEFAULT_DAYBOOK_SEARCH.page),
    limit: parseDaybookPageSize(search.limit),
    receiptNumber: parseReceiptNumber(search.receiptNumber),
    searchBy: searchByResult.success ? searchByResult.data : DEFAULT_DAYBOOK_SEARCH.searchBy,
  };
}

export function toDaybookListParams(
  filters: DaybookSearch,
): Pick<DaybookSearch, 'type' | 'sortBy' | 'page' | 'limit'> {
  return {
    type: filters.type,
    sortBy: filters.sortBy,
    page: filters.page,
    limit: filters.limit,
  };
}
