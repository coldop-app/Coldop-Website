import { useQuery, queryOptions } from '@tanstack/react-query';
import storeAdminAxiosClient from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';
import { transferStockGatePassKeys } from '@/services/transfer-stock/useCreateTransferStockGatePass';

/* -------------------------------------------------
   Transfer stock gate passes (GET /transfer-stock)
------------------------------------------------- */

export interface TransferStockLocation {
  chamber: string;
  floor: string;
  row: string;
}

/** Farmer storage link summary as returned on transfer list (flat shape). */
export interface TransferStockFarmerLinkSummary {
  name: string;
  accountNumber: number;
  address: string;
  mobileNumber: string;
}

export interface TransferStockItem {
  incomingGatePassId: string;
  gatePassNo: number;
  bagSize: string;
  quantity: number;
  location: TransferStockLocation;
}

export interface TransferStockCreatedBy {
  _id: string;
  name: string;
}

export interface TransferStockIncomingGpBagSize {
  name: string;
  initialQuantity: number;
  currentQuantity: number;
  location: TransferStockLocation;
}

export interface TransferStockCreatedIncomingGatePass {
  _id: string;
  gatePassNo: number;
  date: string;
  type: string;
  variety?: string;
  bagSizes: TransferStockIncomingGpBagSize[];
}

export interface TransferStockSnapshotBagSize {
  name: string;
  currentQuantity: number;
  initialQuantity: number;
  type: string;
  location: TransferStockLocation;
}

export interface TransferStockIncomingSnapshot {
  _id: string;
  gatePassNo: number;
  variety?: string;
  bagSizes: TransferStockSnapshotBagSize[];
}

export interface TransferStockOrderDetail {
  size: string;
  quantityAvailable: number;
  quantityIssued: number;
  location: TransferStockLocation;
}

export interface TransferStockCreatedOutgoingGatePass {
  _id: string;
  incomingGatePassSnapshots: TransferStockIncomingSnapshot[];
  gatePassNo: number;
  date: string;
  type: string;
  truckNumber?: string;
  orderDetails: TransferStockOrderDetail[];
}

export interface TransferStockGatePass {
  _id: string;
  fromFarmerStorageLinkId: TransferStockFarmerLinkSummary;
  toFarmerStorageLinkId: TransferStockFarmerLinkSummary;
  createdBy: TransferStockCreatedBy;
  gatePassNo: number;
  date: string;
  truckNumber: string;
  items: TransferStockItem[];
  remarks?: string;
  createdIncomingGatePassId: TransferStockCreatedIncomingGatePass;
  createdOutgoingGatePassId: TransferStockCreatedOutgoingGatePass;
  createdAt: string;
  updatedAt: string;
}

export interface GetTransferStockGatePassesApiResponse {
  status: string;
  data: TransferStockGatePass[];
  message?: string;
}

export interface TransferStockGatePassesQueryResult {
  data: TransferStockGatePass[];
}

async function fetchTransferStockGatePasses(): Promise<TransferStockGatePassesQueryResult> {
  const { data } =
    await storeAdminAxiosClient.get<GetTransferStockGatePassesApiResponse>(
      '/transfer-stock'
    );

  if (data.status !== 'Success' || !Array.isArray(data.data)) {
    throw new Error(data.message ?? 'Failed to fetch transfer stock gate passes');
  }

  return { data: data.data };
}

export const transferStockGatePassesQueryOptions = () =>
  queryOptions({
    queryKey: transferStockGatePassKeys.list(),
    queryFn: fetchTransferStockGatePasses,
  });

/** List transfer stock gate passes for the current cold storage. */
export function useGetTransferStockGatePasses() {
  return useQuery(transferStockGatePassesQueryOptions());
}

export function prefetchTransferStockGatePasses() {
  return queryClient.prefetchQuery(transferStockGatePassesQueryOptions());
}
