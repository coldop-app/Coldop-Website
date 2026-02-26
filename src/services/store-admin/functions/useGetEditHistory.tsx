import { useQuery, queryOptions } from '@tanstack/react-query';
import storeAdminAxiosClient from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';

/* -------------------------------------------------
   Edit history types (GET /edit-history/storage)
   Returns list of edits for the current cold storage.
------------------------------------------------- */

export interface EditHistoryBagSizeLocation {
  chamber: string;
  floor: string;
  row: string;
}

export interface EditHistoryBagSize {
  name: string;
  initialQuantity: number;
  currentQuantity: number;
  location: EditHistoryBagSizeLocation;
}

/** Snapshot of a document before/after an edit (e.g. incoming gate pass). */
export interface EditHistorySnapshot {
  _id: string;
  farmerStorageLinkId: string;
  createdBy: string;
  gatePassNo: number;
  date: string;
  type: string;
  variety?: string;
  truckNumber?: string;
  bagSizes: EditHistoryBagSize[];
  status: string;
  remarks: string;
  manualParchiNumber?: string;
  createdAt: string;
  updatedAt: string;
  rentEntryVoucherId?: string;
  /** Shown only when special fields are enabled for the store. */
  customMarka?: string;
  /** Shown only when special fields are enabled for the store. */
  stockFilter?: string;
}

export interface EditHistoryEditedBy {
  _id: string;
  name: string;
}

export interface EditHistoryEntry {
  _id: string;
  entityType: string;
  documentId: string;
  coldStorageId: string;
  editedBy: EditHistoryEditedBy;
  editedAt: string;
  action: string;
  changeSummary: string;
  snapshotBefore: EditHistorySnapshot;
  snapshotAfter: EditHistorySnapshot;
}

export interface EditHistoryApiResponse {
  success: boolean;
  data: EditHistoryEntry[];
  message?: string;
}

/** Query key factory */
export const editHistoryKeys = {
  all: ['store-admin', 'edit-history'] as const,
  list: () => [...editHistoryKeys.all, 'storage'] as const,
};

export interface EditHistoryQueryResult {
  data: EditHistoryEntry[];
  message?: string;
}

/** Fetcher used by queryOptions and prefetch */
async function fetchEditHistory(): Promise<EditHistoryQueryResult> {
  const { data } = await storeAdminAxiosClient.get<EditHistoryApiResponse>(
    '/edit-history/storage'
  );

  if (!data.success || !Array.isArray(data.data)) {
    throw new Error(data.message ?? 'Failed to fetch edit history');
  }

  return {
    data: data.data,
    message: data.message,
  };
}

/** Query options – use with useQuery, prefetchQuery, or in loaders */
export const editHistoryQueryOptions = () =>
  queryOptions({
    queryKey: editHistoryKeys.list(),
    queryFn: fetchEditHistory,
  });

/** Hook to fetch edit history for the current cold storage. */
export function useGetEditHistory() {
  return useQuery(editHistoryQueryOptions());
}

/** Prefetch edit history – e.g. before navigating to edit history page */
export function prefetchEditHistory() {
  return queryClient.prefetchQuery(editHistoryQueryOptions());
}
