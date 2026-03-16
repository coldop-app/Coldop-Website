import { useQuery, queryOptions } from '@tanstack/react-query';
import storeAdminAxiosClient from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';

/* -------------------------------------------------
   Types for GET /transfer-stock
   (matches the API response you shared)
-------------------------------------------------- */

export interface TransferStockLocation {
  chamber: string;
  floor: string;
  row: string;
}

export interface TransferStockItem {
  incomingGatePassId: string;
  gatePassNo: number;
  bagSize: string;
  quantity: number;
  location: TransferStockLocation;
}

export interface TransferStockCreatedIncomingGatePassBagSize {
  name: string;
  initialQuantity: number;
  currentQuantity: number;
  location: TransferStockLocation;
}

export interface TransferStockCreatedIncomingGatePass {
  _id: string;
  gatePassNo: number;
  date: string;
  type: 'RECEIPT';
  variety: string;
  bagSizes: TransferStockCreatedIncomingGatePassBagSize[];
}

export interface TransferStockFarmerSummary {
  name: string;
  accountNumber: number;
  address: string;
  mobileNumber: string;
}

export interface TransferStockCreatedBy {
  _id: string;
  name: string;
}

export interface TransferStockEntry {
  _id: string;
  fromFarmerStorageLinkId: TransferStockFarmerSummary;
  toFarmerStorageLinkId: TransferStockFarmerSummary;
  createdBy: TransferStockCreatedBy;
  gatePassNo: number;
  date: string;
  items: TransferStockItem[];
  createdIncomingGatePassId: TransferStockCreatedIncomingGatePass | null;
  truckNumber?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransferStockApiResponse {
  status: string;
  data: TransferStockEntry[];
  message?: string;
}

/* -------------------------------------------------
   Query keys
-------------------------------------------------- */

export const transferGatePassesKeys = {
  all: ['transfer-stock'] as const,
  lists: () => [...transferGatePassesKeys.all, 'list'] as const,
  list: () => [...transferGatePassesKeys.lists()] as const,
};

/* -------------------------------------------------
   Fetcher
-------------------------------------------------- */

async function fetchTransferGatePasses(): Promise<TransferStockEntry[]> {
  const { data } =
    await storeAdminAxiosClient.get<TransferStockApiResponse>('/transfer-stock');

  if (data.status !== 'Success' || !Array.isArray(data.data)) {
    throw new Error(data.message ?? 'Failed to fetch transfer stock gate passes');
  }

  return data.data;
}

export const transferGatePassesQueryOptions = () =>
  queryOptions({
    queryKey: transferGatePassesKeys.list(),
    queryFn: () => fetchTransferGatePasses(),
  });

/* -------------------------------------------------
   Hook & prefetch
-------------------------------------------------- */

export function useGetTransferGatePasses() {
  return useQuery(transferGatePassesQueryOptions());
}

export function prefetchTransferGatePasses() {
  return queryClient.prefetchQuery(transferGatePassesQueryOptions());
}

