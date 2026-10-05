import type {
  DaybookCreatedBy,
  DaybookFarmerStorageLink,
  DaybookLocation,
  IncomingBagSize,
} from '@/features/daybook/types';

export type CreateIncomingGatePassBagSize = IncomingBagSize;

export type CreateIncomingGatePassPayload = {
  farmerStorageLinkId: string;
  date: string;
  variety: string;
  bagSizes: CreateIncomingGatePassBagSize[];
  truckNumber?: string;
  remarks?: string;
  manualParchiNumber?: string;
  stockFilter?: string;
  customMarka?: string;
  amount?: number;
  coldStorageId?: string;
  createdById?: string;
};

export type IncomingGatePassRecord = {
  _id: string;
  farmerStorageLinkId: DaybookFarmerStorageLink;
  createdBy: DaybookCreatedBy;
  gatePassNo: number;
  date: string;
  type: 'RECEIPT' | string;
  variety: string;
  truckNumber?: string;
  bagSizes: CreateIncomingGatePassBagSize[];
  status: string;
  remarks?: string;
  manualParchiNumber?: string;
  stockFilter?: string;
  customMarka?: string;
  rentEntryVoucherId?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateIncomingGatePassResponse = {
  success: boolean;
  message?: string;
  data: IncomingGatePassRecord | null;
};

export type UpdateIncomingGatePassPayload = {
  farmerStorageLinkId?: string;
  date?: string;
  variety?: string;
  truckNumber?: string;
  remarks?: string;
  manualParchiNumber?: string;
  stockFilter?: string;
  customMarka?: string;
  amount?: number;
  bagSizes?: CreateIncomingGatePassBagSize[];
};

export type UpdateIncomingGatePassResponse = {
  success: boolean;
  message?: string;
  data: IncomingGatePassRecord | null;
};

export type IncomingGatePassesByFarmerLinkResponse = {
  success: boolean;
  message?: string;
  data: IncomingGatePassRecord[] | null;
};

export type IncomingGatePassDetailFarmer = {
  name: string;
  accountNumber: number;
  address: string;
  mobileNumber: string;
};

export type IncomingGatePassDetailBagSize = {
  name: string;
  initialQuantity: number;
  currentQuantity: number;
  location: DaybookLocation;
  previousLocation?: DaybookLocation[];
};

export type IncomingGatePassDetailLedger = {
  _id: string;
  name: string;
  category: string;
};

export type IncomingGatePassRentVoucher = {
  _id: string;
  voucherNumber: number;
  date: string;
  amount: number;
  debitLedger: IncomingGatePassDetailLedger;
  creditLedger: IncomingGatePassDetailLedger;
  farmerStorageLinkId: string;
  narration?: string;
  updatedAt: string;
};

export type IncomingGatePassDetail = {
  _id: string;
  gatePassNo: number;
  date: string;
  type: string;
  variety: string;
  status: string;
  bagSizes: IncomingGatePassDetailBagSize[];
  farmerStorageLinkId: IncomingGatePassDetailFarmer;
  createdBy: DaybookCreatedBy;
  createdAt: string;
  updatedAt: string;
  truckNumber?: string;
  remarks?: string;
  manualParchiNumber?: string;
  stockFilter?: string;
  customMarka?: string;
  rentEntryVoucherId?: IncomingGatePassRentVoucher;
};

export type IncomingGatePassDetailResponse = {
  success: boolean;
  message?: string;
  data: IncomingGatePassDetail | null;
};
