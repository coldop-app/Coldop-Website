import type {
  DaybookCreatedBy,
  DaybookFarmerStorageLink,
  DaybookLocation,
  IncomingBagSize,
} from '@/features/daybook/types';

export type CreateIncomingGatePassBagSize = IncomingBagSize & {
  paltaiLocation?: DaybookLocation;
};

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
