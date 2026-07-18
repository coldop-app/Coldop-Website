import type {
  DaybookCreatedBy,
  DaybookFarmerStorageLink,
  DaybookLocation,
} from '@/features/daybook/types';

export type CreateTransferStockItemPayload = {
  incomingGatePassId: string;
  bagSize: string;
  quantity: number;
  location: DaybookLocation;
};

export type CreateTransferStockPayload = {
  fromFarmerStorageLinkId: string;
  toFarmerStorageLinkId: string;
  date: string;
  items: CreateTransferStockItemPayload[];
  stockFilter?: string;
  customMarka?: string;
  remarks?: string;
  narration?: string;
  truckNumber?: string;
  amount?: number;
  isBuyPotato?: boolean;
  isSellPotato?: boolean;
};

export type TransferStockRecordItem = CreateTransferStockItemPayload & {
  gatePassNo?: number;
};

export type TransferStockRecord = {
  _id: string;
  fromFarmerStorageLinkId: DaybookFarmerStorageLink;
  toFarmerStorageLinkId: DaybookFarmerStorageLink;
  createdBy?: DaybookCreatedBy;
  gatePassNo: number;
  date: string;
  truckNumber?: string;
  items: TransferStockRecordItem[];
  stockFilter?: string;
  customMarka?: string;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateTransferStockResponse = {
  status: 'Success' | 'error' | string;
  message?: string;
  data?: TransferStockRecord | null;
};
