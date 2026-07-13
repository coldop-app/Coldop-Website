export type StorageGatePassBagSlot = {
  size: string;
  currentQuantity: number;
  initialQuantity: number;
  bagType: string;
  chamber: string;
  floor: string;
  row: string;
};

export type StorageGatePass = {
  _id: string;
  farmerStorageLinkId: string;
  accountNumber: number;
  gatePassNo: number;
  manualGatePassNumber?: number;
  manualParchiNumber?: string | null;
  customMarka?: string | null;
  date: string;
  variety: string;
  storageCategory: string;
  bagSizes: StorageGatePassBagSlot[];
  remarks: string;
  stockFilter?: string;
};

/** `${passId}\u001f${size}\u001f${bagIndex}` — unit separator avoids `|` in size names */
export type TransferAllocationKey = string;

export type TransferStockItem = {
  storageGatePassId: string;
  gatePassNo: number;
  bagSize: string;
  bagIndex: number;
  quantity: number;
  location: {
    chamber: string;
    floor: string;
    row: string;
  };
};

export type LocationFilters = {
  chamber: string;
  floor: string;
  row: string;
};

export type VoucherSort = 'asc' | 'desc';

export type DatePassGroup = {
  dateKey: string;
  dateLabel: string;
  passes: StorageGatePass[];
};
