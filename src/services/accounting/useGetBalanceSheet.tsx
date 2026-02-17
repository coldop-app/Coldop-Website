import { useQuery, queryOptions } from '@tanstack/react-query';
import storeAdminAxiosClient from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';

/** Single line item in an assets breakdown */
export interface BalanceSheetBreakdownItem {
  name: string;
  balance: number;
}

/** Fixed or current assets section */
export interface BalanceSheetAssetsSection {
  total: number;
  breakdown: BalanceSheetBreakdownItem[];
}

/** Assets side of the balance sheet */
export interface BalanceSheetAssets {
  fixedAssets: BalanceSheetAssetsSection;
  currentAssets: BalanceSheetAssetsSection;
  total: number;
}

/** Liabilities and equity side (sections are generic objects; may have total/breakdown) */
export interface BalanceSheetLiabilitiesAndEquity {
  currentLiabilities: Record<string, unknown>;
  longTermLiabilities: Record<string, unknown>;
  equity: Record<string, unknown>;
  netProfit: number | null;
  netLoss: number | null;
  total: number;
}

/** Balance sheet data (Indian standard: Assets, Liabilities, Equity) */
export interface BalanceSheetData {
  assets: BalanceSheetAssets;
  liabilitiesAndEquity: BalanceSheetLiabilitiesAndEquity;
}

/** API response shape for GET /ledgers/balance-sheet */
export interface GetBalanceSheetApiResponse {
  success: boolean;
  data: BalanceSheetData;
}

/** Query params for balance sheet (optional from/to for period balances) */
export interface GetBalanceSheetParams {
  from?: string; // date-time
  to?: string; // date-time
}

/** Query key factory */
export const balanceSheetKeys = {
  all: ['balance-sheet'] as const,
  lists: () => [...balanceSheetKeys.all, 'list'] as const,
  list: (params?: GetBalanceSheetParams) =>
    [...balanceSheetKeys.lists(), params ?? {}] as const,
};

/** Fetcher used by queryOptions and prefetch */
async function fetchBalanceSheet(
  params: GetBalanceSheetParams = {}
): Promise<BalanceSheetData> {
  const searchParams: Record<string, string> = {};
  if (params.from != null) searchParams.from = params.from;
  if (params.to != null) searchParams.to = params.to;

  const { data } = await storeAdminAxiosClient.get<GetBalanceSheetApiResponse>(
    '/ledgers/balance-sheet',
    { params: searchParams }
  );

  if (!data.success || data.data == null) {
    throw new Error('Failed to fetch balance sheet');
  }

  return data.data;
}

/** Query options – use with useQuery, prefetchQuery, or in loaders */
export const balanceSheetQueryOptions = (params: GetBalanceSheetParams = {}) =>
  queryOptions({
    queryKey: balanceSheetKeys.list(params),
    queryFn: () => fetchBalanceSheet(params),
  });

/** Hook to fetch balance sheet for the current cold storage (optional from/to for period). */
export function useGetBalanceSheet(params: GetBalanceSheetParams = {}) {
  return useQuery(balanceSheetQueryOptions(params));
}

/** Prefetch balance sheet – e.g. before opening financial statements */
export function prefetchBalanceSheet(params: GetBalanceSheetParams = {}) {
  return queryClient.prefetchQuery(balanceSheetQueryOptions(params));
}
