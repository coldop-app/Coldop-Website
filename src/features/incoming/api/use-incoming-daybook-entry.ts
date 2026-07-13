import { useQueryClient } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';

import { findIncomingEntryInDaybookCache } from '@/features/daybook/api/find-incoming-daybook-entry';
import type { IncomingDaybookEntry } from '@/features/daybook/types';

function subscribeToQueryCache(
  queryClient: ReturnType<typeof useQueryClient>,
  onStoreChange: () => void,
) {
  return queryClient.getQueryCache().subscribe(onStoreChange);
}

export function useIncomingDaybookEntry(id: string): IncomingDaybookEntry | undefined {
  const queryClient = useQueryClient();

  return useSyncExternalStore(
    (onStoreChange) => subscribeToQueryCache(queryClient, onStoreChange),
    () => findIncomingEntryInDaybookCache(queryClient, id),
    () => findIncomingEntryInDaybookCache(queryClient, id),
  );
}
