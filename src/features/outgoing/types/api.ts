import type {
  DaybookCreatedBy,
  DaybookFarmerStorageLink,
  DaybookLocation,
  IncomingGatePassSnapshot,
  OutgoingOrderDetail,
} from '@/features/daybook/types';

export type CreateOutgoingGatePassAllocationPayload = {
  size: string;
  quantityToAllocate: number;
  location?: DaybookLocation;
};

export type CreateOutgoingGatePassIncomingPayload = {
  incomingGatePassId: string;
  variety: string;
  allocations: CreateOutgoingGatePassAllocationPayload[];
};

export type CreateOutgoingGatePassPayload = {
  farmerStorageLinkId: string;
  gatePassNo: number;
  date: string;
  incomingGatePasses: CreateOutgoingGatePassIncomingPayload[];
  stockFilter?: string;
  manualParchiNumber?: number;
  from?: string;
  to?: string;
  truckNumber?: string;
  remarks?: string;
  idempotencyKey?: string;
};

export type OutgoingGatePassRecord = {
  _id: string;
  farmerStorageLinkId: DaybookFarmerStorageLink;
  createdBy?: DaybookCreatedBy;
  incomingGatePassSnapshots?: IncomingGatePassSnapshot[];
  gatePassNo: number;
  stockFilter?: string;
  manualParchiNumber?: number;
  date: string;
  from?: string;
  to?: string;
  truckNumber?: string;
  orderDetails?: OutgoingOrderDetail[];
  remarks?: string;
  idempotencyKey?: string;
  isNull?: boolean;
  nulledAt?: string;
  nulledBy?: DaybookCreatedBy;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateOutgoingGatePassResponse = {
  status: 'Success' | 'error' | string;
  message?: string;
  data?: OutgoingGatePassRecord | null;
};

export type UpdateOutgoingGatePassPayload = {
  date?: string;
  stockFilter?: string;
  manualParchiNumber?: number;
  from?: string;
  to?: string;
  truckNumber?: string;
  remarks?: string;
  incomingGatePasses?: CreateOutgoingGatePassIncomingPayload[];
};

export type UpdateOutgoingGatePassResponse = {
  status: 'Success' | 'error' | string;
  message?: string;
  data?: OutgoingGatePassRecord | null;
};

export type NullOutgoingGatePassPayload = {
  remarks?: string;
};

export type NullOutgoingGatePassResponse = {
  status: 'Success' | 'error' | string;
  message?: string;
  data?: OutgoingGatePassRecord | null;
};
