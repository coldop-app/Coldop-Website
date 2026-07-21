export type DaybookLocation = {
  chamber: string;
  floor: string;
  row: string;
};

export type DaybookFarmerStorageLink = {
  _id?: string;
  name: string;
  accountNumber: number;
  address: string;
  mobileNumber: string;
};

export type DaybookCreatedBy = {
  _id: string;
  name: string;
};

export type IncomingBagSize = {
  name: string;
  initialQuantity: number;
  currentQuantity: number;
  location: DaybookLocation;
  paltaiLocation?: DaybookLocation[];
};

export type IncomingDaybookEntry = {
  _id: string;
  gatePassNo: number;
  manualParchiNumber?: string | number;
  stockFilter?: string;
  customMarka?: string;
  date: string;
  createdAt: string;
  updatedAt?: string;
  type: 'RECEIPT' | 'Incoming-transfer' | string;
  variety: string;
  truckNumber?: string;
  bagSizes?: IncomingBagSize[];
  status: string;
  remarks?: string;
  rentEntryVoucherId?: string;
  farmerStorageLinkId: DaybookFarmerStorageLink;
  createdBy?: DaybookCreatedBy | null;
};

export type OutgoingSnapshotBagSize = {
  name: string;
  initialQuantity: number;
  currentQuantity: number;
  type: string;
  quantityIssued: number;
  location: DaybookLocation;
  paltaiLocation?: DaybookLocation[];
};

export type IncomingGatePassSnapshot = {
  _id: string;
  gatePassNo: number;
  variety: string;
  bagSizes: OutgoingSnapshotBagSize[];
};

export type OutgoingOrderDetail = {
  size: string;
  quantityAvailable: number;
  quantityIssued: number;
  location: DaybookLocation;
};

export type OutgoingDaybookEntry = {
  _id: string;
  gatePassNo: number;
  manualParchiNumber?: string | number;
  stockFilter?: string;
  truckNumber?: string;
  from?: string;
  to?: string;
  date: string;
  createdAt: string;
  updatedAt?: string;
  type?: 'DELIVERY' | 'Outgoing-transfer' | string;
  variety?: string;
  orderDetails?: OutgoingOrderDetail[];
  incomingGatePassSnapshots?: IncomingGatePassSnapshot[];
  remarks?: string;
  isNull?: boolean;
  nulledAt?: string;
  nulledBy?: DaybookCreatedBy | null;
  farmerStorageLinkId: DaybookFarmerStorageLink;
  createdBy?: DaybookCreatedBy | null;
};

export type DaybookEntry = IncomingDaybookEntry | OutgoingDaybookEntry;

export type DaybookPagination = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: number | null;
  previousPage: number | null;
};

export function isOutgoingDaybookEntry(entry: DaybookEntry): entry is OutgoingDaybookEntry {
  return 'orderDetails' in entry && Array.isArray(entry.orderDetails);
}

export function isIncomingDaybookEntry(entry: DaybookEntry): entry is IncomingDaybookEntry {
  return 'bagSizes' in entry && Array.isArray(entry.bagSizes);
}
