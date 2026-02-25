import { useQuery, queryOptions } from '@tanstack/react-query';
import storeAdminAxiosClient from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';

/* -------------------------------------------------
   Daybook entry types (GET /store-admin/daybook)
   Items can be RECEIPT (incoming) or DELIVERY (outgoing).
------------------------------------------------- */

export interface DaybookBagSizeLocation {
  chamber: string;
  floor: string;
  row: string;
}

export interface DaybookBagSize {
  name: string;
  initialQuantity: number;
  currentQuantity: number;
  location: DaybookBagSizeLocation;
}

export interface DaybookOrderDetail {
  size: string;
  quantityAvailable: number;
  quantityIssued: number;
  /** Storage location (chamber-floor-row) when present in API response; used to match snapshot rows. */
  location?: { chamber?: string; floor?: string; row?: string };
  /** Incoming gate pass number from which bags were issued (when present in API response). API may send as incomingGatePassNo or gatePassNumber. */
  incomingGatePassNo?: number;
  gatePassNumber?: number;
}

/** Bag size within an incoming gate pass snapshot (outgoing voucher only). */
export interface DaybookIncomingGatePassSnapshotBagSize {
  location: DaybookBagSizeLocation;
  name: string;
  currentQuantity: number;
  initialQuantity: number;
}

/** Snapshot of an incoming gate pass linked to an outgoing (DELIVERY) voucher. */
export interface DaybookIncomingGatePassSnapshot {
  _id: string;
  gatePassNo: number;
  variety?: string;
  bagSizes: DaybookIncomingGatePassSnapshotBagSize[];
}

/** Allocation within an outgoing incoming entry (size + quantity only). */
export interface DaybookOutgoingAllocation {
  size: string;
  quantityToAllocate: number;
}

/** Incoming gate pass entry on an outgoing (DELIVERY) voucher – new API shape. */
export interface DaybookOutgoingIncomingEntry {
  incomingGatePassId: string;
  variety?: string;
  /** Incoming gate pass number for display when provided by API. */
  gatePassNo?: number;
  allocations: DaybookOutgoingAllocation[];
}

export interface DaybookFarmerStorageLink {
  _id: string;
  farmerId: {
    _id: string;
    name: string;
    address: string;
    mobileNumber: string;
  };
  accountNumber: number;
}

export interface DaybookCreatedBy {
  _id: string;
  name: string;
}

/** Incoming gate pass (RECEIPT) entry – shape for IGP PDF and card. Only these fields are used. */
export interface IncomingGatePassEntry {
  _id: string;
  farmerStorageLinkId: {
    _id: string;
    farmerId: {
      _id: string;
      name: string;
      address: string;
      mobileNumber: string;
    };
    accountNumber: number;
  };
  createdBy: DaybookCreatedBy;
  gatePassNo: number;
  date: string;
  type: 'RECEIPT';
  variety?: string;
  bagSizes: DaybookBagSize[];
  truckNumber?: string;
  status: string;
  remarks: string;
  manualParchiNumber?: string;
  stockFilter?: string;
  customMarka?: string;
  createdAt: string;
}

/** Outgoing gate pass (DELIVERY) entry – shape for OGP PDF and card. */
export interface OutgoingGatePassEntry {
  _id: string;
  farmerStorageLinkId: DaybookFarmerStorageLink;
  createdBy: DaybookCreatedBy;
  gatePassNo: number;
  date: string;
  type: 'DELIVERY';
  variety?: string;
  truckNumber?: string;
  orderDetails?: DaybookOrderDetail[];
  incomingGatePassSnapshots?: DaybookIncomingGatePassSnapshot[];
  incomingGatePassEntries?: DaybookOutgoingIncomingEntry[];
  from?: string;
  to?: string;
  status: string;
  remarks: string;
  manualParchiNumber?: string;
  createdAt: string;
}

/** Single daybook entry – RECEIPT has bagSizes; DELIVERY has orderDetails and/or incomingGatePassEntries, from, to */
export interface DaybookEntry {
  _id: string;
  farmerStorageLinkId: DaybookFarmerStorageLink;
  createdBy: DaybookCreatedBy;
  gatePassNo: number;
  date: string;
  type: 'RECEIPT' | 'DELIVERY';
  /** Legacy top-level variety; prefer varieties from incomingGatePassEntries when present. */
  variety?: string;
  truckNumber?: string;
  /** Present for RECEIPT */
  bagSizes?: DaybookBagSize[];
  /** Present for DELIVERY (legacy/flat list). */
  orderDetails?: DaybookOrderDetail[];
  /** Present for DELIVERY: snapshots of incoming gate passes (legacy, with bagSizes/location). */
  incomingGatePassSnapshots?: DaybookIncomingGatePassSnapshot[];
  /** Present for DELIVERY: per-incoming entry with variety and allocations (new API shape). */
  incomingGatePassEntries?: DaybookOutgoingIncomingEntry[];
  /** Present for DELIVERY */
  from?: string;
  /** Present for DELIVERY */
  to?: string;
  status: string;
  remarks: string;
  manualParchiNumber?: string;
  stockFilter?: string;
  customMarka?: string;
  createdAt: string;
}

export interface DaybookPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: number | null;
  previousPage: number | null;
}

export interface DaybookApiResponse {
  status: string;
  message?: string;
  data: DaybookEntry[];
  pagination: DaybookPagination;
}

/** Daybook filter type – incoming (RECEIPT), outgoing (DELIVERY), or all */
export type DaybookType = 'incoming' | 'outgoing' | 'all';

/** Sort order: latest = higher gatePassNo first, oldest = lower gatePassNo first */
export type DaybookSortBy = 'latest' | 'oldest';

/**
 * Query params for daybook list.
 * API: type=all|incoming|outgoing, sortBy=latest|oldest, page>=1, limit 1–100.
 */
export interface GetDaybookParams {
  type?: DaybookType;
  sortBy?: DaybookSortBy;
  page?: number;
  limit?: number;
}

const defaultParams: Required<GetDaybookParams> = {
  type: 'all',
  sortBy: 'latest',
  page: 1,
  limit: 10,
};

/** Query key factory */
export const daybookKeys = {
  all: ['store-admin', 'daybook'] as const,
  lists: () => [...daybookKeys.all, 'list'] as const,
  list: (params: GetDaybookParams) => [...daybookKeys.lists(), params] as const,
};

const MIN_LIMIT = 1;
const MAX_LIMIT = 100;

export interface DaybookQueryResult {
  data: DaybookEntry[];
  pagination: DaybookPagination;
  message?: string;
}

/** Fetcher used by queryOptions and prefetch */
async function fetchDaybook(
  params: GetDaybookParams = {}
): Promise<DaybookQueryResult> {
  const {
    type,
    sortBy,
    page,
    limit: rawLimit,
  } = {
    ...defaultParams,
    ...params,
  };
  const pageNum = Math.max(1, Math.floor(page));
  const limitNum = Math.max(
    MIN_LIMIT,
    Math.min(MAX_LIMIT, Math.floor(rawLimit))
  );

  const { data } = await storeAdminAxiosClient.get<DaybookApiResponse>(
    '/store-admin/daybook',
    { params: { type, sortBy, page: pageNum, limit: limitNum } }
  );

  /** API returns status "Fail" with message when there are no orders (e.g. "Cold storage doesn't have any orders") */
  if (data.status === 'Fail' && data.pagination?.totalItems === 0) {
    return {
      data: [],
      pagination: data.pagination,
      message: data.message,
    };
  }

  if (data.status !== 'Success' || !Array.isArray(data.data)) {
    throw new Error(data.message ?? 'Failed to fetch daybook');
  }

  return {
    data: data.data,
    pagination: data.pagination,
    message: data.message,
  };
}

/** Query options – use with useQuery, prefetchQuery, or in loaders */
export const daybookQueryOptions = (params: GetDaybookParams = {}) =>
  queryOptions({
    queryKey: daybookKeys.list(params),
    queryFn: () => fetchDaybook(params),
  });

/** Hook to fetch daybook (type, sortBy, page, limit). */
export function useGetDaybook(params: GetDaybookParams = {}) {
  return useQuery(daybookQueryOptions(params));
}

/** Prefetch daybook – e.g. before navigating to daybook page */
export function prefetchDaybook(params: GetDaybookParams = {}) {
  return queryClient.prefetchQuery(daybookQueryOptions(params));
}
