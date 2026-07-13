import { useQueryClient } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';

import { findOutgoingEntryInDaybookCache } from '@/features/daybook/api/find-outgoing-daybook-entry';
import type { OutgoingDaybookEntry } from '@/features/daybook/types';

function subscribeToQueryCache(
  queryClient: ReturnType<typeof useQueryClient>,
  onStoreChange: () => void,
) {
  return queryClient.getQueryCache().subscribe(onStoreChange);
}

export function useOutgoingDaybookEntry(id: string): OutgoingDaybookEntry | undefined {
  const queryClient = useQueryClient();

  return useSyncExternalStore(
    (onStoreChange) => subscribeToQueryCache(queryClient, onStoreChange),
    () => findOutgoingEntryInDaybookCache(queryClient, id),
    () => findOutgoingEntryInDaybookCache(queryClient, id),
  );
}
