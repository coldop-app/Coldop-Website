import { DAYBOOK_PAGE_SIZE_OPTIONS } from '@/features/daybook/search';

export type IncomingEditHistorySearch = {
  page: number;
  limit: number;
  incomingGatePassId?: string;
};

export const DEFAULT_INCOMING_EDIT_HISTORY_SEARCH: IncomingEditHistorySearch = {
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

  return DEFAULT_INCOMING_EDIT_HISTORY_SEARCH.limit;
}

function parsePositiveInt(value: unknown, fallback: number): number {
  const parsed = typeof value === 'number' ? value : Number(value);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.floor(parsed);
}

function parseIncomingGatePassId(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function parseIncomingEditHistorySearch(
  search: Record<string, unknown>,
): IncomingEditHistorySearch {
  return {
    page: parsePositiveInt(search.page, DEFAULT_INCOMING_EDIT_HISTORY_SEARCH.page),
    limit: parsePageSize(search.limit),
    incomingGatePassId: parseIncomingGatePassId(search.incomingGatePassId),
  };
}

export function toIncomingEditHistoryParams(
  filters: IncomingEditHistorySearch,
): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: filters.page,
    limit: filters.limit,
  };

  if (filters.incomingGatePassId) {
    params.incomingGatePassId = filters.incomingGatePassId;
  }

  return params;
}
