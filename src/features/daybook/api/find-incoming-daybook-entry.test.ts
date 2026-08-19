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

import { findIncomingEntryInDaybookCache } from '@/features/daybook/api/find-incoming-daybook-entry';
import type { IncomingDaybookEntry, OutgoingDaybookEntry } from '@/features/daybook/types';
import { FARMER_GATE_PASSES_QUERY_KEY } from '@/features/people/api/use-farmer-gate-passes';
import {
  FARMER_LINK_ID,
  makeIncomingDaybookEntry,
  makeOutgoingDaybookEntry,
} from '@/test/fixtures';

const DAYBOOK_QUERY_KEY = ['daybook'] as const;
const DAYBOOK_SEARCH_QUERY_KEY = ['daybook', 'search'] as const;

const INCOMING_ID = '674c8a1b2d3e4f5678901240';

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

function seedFarmerGatePasses(
  queryClient: QueryClient,
  entries: (IncomingDaybookEntry | OutgoingDaybookEntry)[],
) {
  queryClient.setQueryData([...FARMER_GATE_PASSES_QUERY_KEY, FARMER_LINK_ID, {}], {
    entries,
    summaries: {
      totalIncomingBags: 0,
      totalOutgoingBags: 0,
      totalInternallyTransferredIncomingBags: 0,
      totalInternallyTransferredOutgoingBags: 0,
    },
  });
}

describe('findIncomingEntryInDaybookCache', () => {
  it('finds an incoming entry in the daybook list cache', () => {
    const queryClient = new QueryClient();
    const incoming = makeIncomingDaybookEntry({ _id: INCOMING_ID });
    const outgoing = makeOutgoingDaybookEntry();

    seedDaybookList(queryClient, [incoming, outgoing]);

    expect(findIncomingEntryInDaybookCache(queryClient, INCOMING_ID)?._id).toBe(INCOMING_ID);
  });

  it('finds an incoming entry in the daybook search cache', () => {
    const queryClient = new QueryClient();
    const incoming = makeIncomingDaybookEntry({ _id: INCOMING_ID });

    queryClient.setQueryData(
      [...DAYBOOK_SEARCH_QUERY_KEY, { receiptNumber: '12', searchBy: 'gatePassNo' }],
      {
        incoming: [incoming],
        outgoing: [],
      },
    );

    expect(findIncomingEntryInDaybookCache(queryClient, INCOMING_ID)?._id).toBe(INCOMING_ID);
  });

  it('finds an incoming entry in the farmer gate-passes cache', () => {
    const queryClient = new QueryClient();
    const incoming = makeIncomingDaybookEntry({ _id: INCOMING_ID });

    seedFarmerGatePasses(queryClient, [incoming, makeOutgoingDaybookEntry()]);

    expect(findIncomingEntryInDaybookCache(queryClient, INCOMING_ID)?._id).toBe(INCOMING_ID);
  });

  it('returns undefined when the entry is not cached', () => {
    const queryClient = new QueryClient();
    expect(findIncomingEntryInDaybookCache(queryClient, INCOMING_ID)).toBeUndefined();
  });
});
