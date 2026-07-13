import { DAYBOOK_PAGE_SIZE_OPTIONS } from '@/features/daybook/search';

export type OutgoingEditHistorySearch = {
  page: number;
  limit: number;
  outgoingGatePassId?: string;
};

export const DEFAULT_OUTGOING_EDIT_HISTORY_SEARCH: OutgoingEditHistorySearch = {
  page: 1,
  limit: DAYBOOK_PAGE_SIZE_OPTIONS[0],
};

function parsePageSize(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number(value);

  if (
    Number.isFinite(parsed) &&
    DAYBOOK_PAGE_SIZE_OPTIONS.includes(parsed as (typeof DAYBOOK_PAGE_SIZE_OPTIONS)[number])
  ) {
    return parsed;
  }

  return DEFAULT_OUTGOING_EDIT_HISTORY_SEARCH.limit;
}

function parsePositiveInt(value: unknown, fallback: number): number {
  const parsed = typeof value === 'number' ? value : Number(value);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.floor(parsed);
}

function parseOutgoingGatePassId(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function parseOutgoingEditHistorySearch(
  search: Record<string, unknown>,
): OutgoingEditHistorySearch {
  return {
    page: parsePositiveInt(search.page, DEFAULT_OUTGOING_EDIT_HISTORY_SEARCH.page),
    limit: parsePageSize(search.limit),
    outgoingGatePassId: parseOutgoingGatePassId(search.outgoingGatePassId),
  };
}

export function toOutgoingEditHistoryParams(
  filters: OutgoingEditHistorySearch,
): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: filters.page,
    limit: filters.limit,
  };

  if (filters.outgoingGatePassId) {
    params.outgoingGatePassId = filters.outgoingGatePassId;
  }

  return params;
}
