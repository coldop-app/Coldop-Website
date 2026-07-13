import type {
  DaybookCreatedBy,
  DaybookFarmerStorageLink,
  DaybookLocation,
} from '@/features/daybook/types';

export type TransferStockReportParams = {
  dateFrom?: string;
  dateTo?: string;
};

export type TransferStockReportItem = {
  incomingGatePassId: string;
  gatePassNo: number;
  bagSize: string;
  quantity: number;
  location: DaybookLocation;
};

export type TransferStockReportRecord = {
  _id: string;
  gatePassNo: number;
  date: string;
  truckNumber?: string;
  remarks?: string;
  customMarka?: string;
  items: TransferStockReportItem[];
  totalBags: number;
  fromFarmerStorageLinkId: DaybookFarmerStorageLink;
  toFarmerStorageLinkId: DaybookFarmerStorageLink;
  createdIncomingGatePassId?: string;
  createdOutgoingGatePassId?: string;
  createdBy?: DaybookCreatedBy;
};

export type TransferStockReportResult = {
  transferStockGatePasses: TransferStockReportRecord[];
};

export type GetTransferStockReportResponse = {
  success: boolean;
  data: TransferStockReportResult;
  message?: string;
};
