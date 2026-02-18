import { useQuery, queryOptions } from '@tanstack/react-query';
import storeAdminAxiosClient from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';

import type {
  DaybookBagSizeLocation,
  IncomingGatePassEntry,
  OutgoingGatePassEntry,
} from '@/services/store-admin/functions/useGetDaybook';

/* -------------------------------------------------
   Report API types (GET /analytics/get-reports)
   Same entry shapes as daybook; snapshot bag size may have type.
------------------------------------------------- */

/** Bag size in report snapshot (outgoing) – API may include type: "DELIVERY" */
export interface ReportSnapshotBagSize {
  name: string;
  currentQuantity: number;
  initialQuantity: number;
  location: DaybookBagSizeLocation;
  type?: string;
}

/** Incoming gate pass snapshot in an outgoing report entry */
export interface ReportIncomingGatePassSnapshot {
  _id: string;
  gatePassNo: number;
  variety?: string;
  bagSizes: ReportSnapshotBagSize[];
}

/** Outgoing gate pass entry in report – same as daybook with optional number manualParchiNumber */
export interface ReportOutgoingEntry extends Omit<OutgoingGatePassEntry, 'manualParchiNumber'> {
  manualParchiNumber?: string | number;
  incomingGatePassSnapshots?: ReportIncomingGatePassSnapshot[];
}

/** Farmer summary in grouped report */
export interface ReportFarmerSummary {
  name: string;
  mobileNumber: string;
  address: string;
  accountNumber: number;
}

/** One farmer's block in grouped response */
export interface ReportFarmerBlock {
  farmer: ReportFarmerSummary;
  incoming: IncomingGatePassEntry[];
  outgoing: ReportOutgoingEntry[];
}

/** Response when groupByFarmers=true */
export interface GetReportsDataGrouped {
  from: string;
  to: string;
  groupedByFarmer: boolean;
  farmers: ReportFarmerBlock[];
}

/** Response when groupByFarmers=false */
export interface GetReportsDataFlat {
  from: string;
  to: string;
  incoming: IncomingGatePassEntry[];
  outgoing: ReportOutgoingEntry[];
}

export type GetReportsData = GetReportsDataGrouped | GetReportsDataFlat;

export function isReportsDataGrouped(
  data: GetReportsData
): data is GetReportsDataGrouped {
  return 'farmers' in data && Array.isArray((data as GetReportsDataGrouped).farmers);
}

/** API response wrapper */
export interface GetReportsApiResponse {
  success: boolean;
  data: GetReportsData;
  message: string;
}

/** Query params – dates in YYYY-MM-DD format */
export interface GetReportsParams {
  from: string;
  to: string;
  groupByFarmers: boolean;
}

/** Query key factory */
export const getReportsKeys = {
  all: ['analytics', 'get-reports'] as const,
  detail: (params: GetReportsParams) =>
    [...getReportsKeys.all, params.from, params.to, params.groupByFarmers] as const,
};

async function fetchGetReports(params: GetReportsParams): Promise<GetReportsData> {
  const { data } = await storeAdminAxiosClient.get<GetReportsApiResponse>(
    '/analytics/get-reports',
    {
      params: {
        from: params.from,
        to: params.to,
        groupByFarmers: params.groupByFarmers,
      },
    }
  );

  if (!data.success || data.data == null) {
    throw new Error(data.message ?? 'Failed to fetch reports');
  }

  return data.data;
}

/** Query options – use with useQuery or prefetchQuery. No cache so reports are always fresh. */
export const getReportsQueryOptions = (params: GetReportsParams) =>
  queryOptions({
    queryKey: getReportsKeys.detail(params),
    queryFn: () => fetchGetReports(params),
    enabled: !!params.from?.trim() && !!params.to?.trim(),
    // Disable cache for this route only – always fetch fresh when user clicks Get Reports
    staleTime: 0,
    gcTime: 0,
  });

/**
 * Hook to fetch reports for a date range.
 * @param params - from, to (YYYY-MM-DD), groupByFarmers
 * @param options.enabled - override when to run the query (default: when from and to are set)
 */
export function useGetReports(
  params: GetReportsParams | null,
  options?: { enabled?: boolean }
) {
  const enabled =
    options?.enabled !== undefined
      ? options.enabled
      : !!params?.from?.trim() && !!params?.to?.trim();

  return useQuery({
    ...getReportsQueryOptions(params ?? { from: '', to: '', groupByFarmers: false }),
    enabled: !!params && enabled,
  });
}

/** Prefetch reports – e.g. before opening report view */
export function prefetchGetReports(params: GetReportsParams) {
  if (!params?.from?.trim() || !params?.to?.trim()) return Promise.resolve();
  return queryClient.prefetchQuery(getReportsQueryOptions(params));
}
