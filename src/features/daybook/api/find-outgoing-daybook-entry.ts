import type { QueryClient } from '@tanstack/react-query';

import { DAYBOOK_QUERY_KEY, type DaybookResult } from '@/features/daybook/api/use-daybook';
import {
  DAYBOOK_SEARCH_QUERY_KEY,
  type DaybookSearchResult,
} from '@/features/daybook/api/use-daybook-search';
import { isOutgoingDaybookEntry, type OutgoingDaybookEntry } from '@/features/daybook/types';
import {
  FARMER_GATE_PASSES_QUERY_KEY,
  type FarmerGatePassResult,
} from '@/features/people/api/use-farmer-gate-passes';

export function findOutgoingEntryInDaybookCache(
  queryClient: QueryClient,
  id: string,
): OutgoingDaybookEntry | undefined {
  const listQueries = queryClient.getQueriesData<DaybookResult>({
    queryKey: DAYBOOK_QUERY_KEY,
  });

  for (const [, data] of listQueries) {
    for (const entry of data?.entries ?? []) {
      if (isOutgoingDaybookEntry(entry) && entry._id === id) {
        return entry;
      }
    }
  }

  const searchQueries = queryClient.getQueriesData<DaybookSearchResult>({
    queryKey: DAYBOOK_SEARCH_QUERY_KEY,
  });

  for (const [, data] of searchQueries) {
    const found = data?.outgoing.find((entry) => entry._id === id);
    if (found) return found;
  }

  const farmerQueries = queryClient.getQueriesData<FarmerGatePassResult>({
    queryKey: FARMER_GATE_PASSES_QUERY_KEY,
  });

  for (const [, data] of farmerQueries) {
    for (const entry of data?.entries ?? []) {
      if (isOutgoingDaybookEntry(entry) && entry._id === id) {
        return entry;
      }
    }
  }

  return undefined;
}
