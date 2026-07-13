import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/api-client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
  getApiErrorMessage: vi.fn(() => 'error'),
}));

import { findOutgoingEntryInDaybookCache } from '@/features/daybook/api/find-outgoing-daybook-entry';
import type { IncomingDaybookEntry, OutgoingDaybookEntry } from '@/features/daybook/types';
import { makeIncomingDaybookEntry, makeOutgoingDaybookEntry } from '@/test/fixtures';

const DAYBOOK_QUERY_KEY = ['daybook'] as const;
const DAYBOOK_SEARCH_QUERY_KEY = ['daybook', 'search'] as const;

const OUTGOING_ID = '674c8a1b2d3e4f5678901250';

function seedDaybookList(
  queryClient: QueryClient,
  entries: (IncomingDaybookEntry | OutgoingDaybookEntry)[],
) {
  queryClient.setQueryData([...DAYBOOK_QUERY_KEY, {}], {
    entries,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: entries.length,
      itemsPerPage: 10,
      hasNextPage: false,
      hasPreviousPage: false,
      nextPage: null,
      previousPage: null,
    },
  });
}

describe('findOutgoingEntryInDaybookCache', () => {
  it('finds an outgoing entry in the daybook list cache', () => {
    const queryClient = new QueryClient();
    const outgoing = makeOutgoingDaybookEntry({ _id: OUTGOING_ID });
    const incoming = makeIncomingDaybookEntry();

    seedDaybookList(queryClient, [incoming, outgoing]);

    expect(findOutgoingEntryInDaybookCache(queryClient, OUTGOING_ID)?._id).toBe(OUTGOING_ID);
  });

  it('finds an outgoing entry in the daybook search cache', () => {
    const queryClient = new QueryClient();
    const outgoing = makeOutgoingDaybookEntry({ _id: OUTGOING_ID });

    queryClient.setQueryData(
      [...DAYBOOK_SEARCH_QUERY_KEY, { receiptNumber: '24', searchBy: 'gatePassNo' }],
      {
        incoming: [],
        outgoing: [outgoing],
      },
    );

    expect(findOutgoingEntryInDaybookCache(queryClient, OUTGOING_ID)?._id).toBe(OUTGOING_ID);
  });

  it('returns undefined when the entry is not cached', () => {
    const queryClient = new QueryClient();
    expect(findOutgoingEntryInDaybookCache(queryClient, OUTGOING_ID)).toBeUndefined();
  });
});
