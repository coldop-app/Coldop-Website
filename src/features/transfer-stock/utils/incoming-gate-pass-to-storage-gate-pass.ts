import type { IncomingGatePassRecord } from '@/features/incoming/types/api';
import type {
  StorageGatePass,
  StorageGatePassBagSlot,
} from '@/features/transfer-stock/types/storage-gate-pass';

function parseManualGatePassNumber(manualParchiNumber?: string | null): number | undefined {
  if (manualParchiNumber == null || manualParchiNumber.trim() === '') {
    return undefined;
  }

  const parsed = Number.parseInt(manualParchiNumber, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function mapBagSize(bag: IncomingGatePassRecord['bagSizes'][number]): StorageGatePassBagSlot {
  return {
    size: bag.name,
    currentQuantity: bag.currentQuantity,
    initialQuantity: bag.initialQuantity,
    bagType: '',
    chamber: bag.location?.chamber ?? '',
    floor: bag.location?.floor ?? '',
    row: bag.location?.row ?? '',
  };
}

export function incomingGatePassToStorageGatePass(
  record: IncomingGatePassRecord,
  farmerStorageLinkId: string,
): StorageGatePass {
  return {
    _id: record._id,
    farmerStorageLinkId,
    accountNumber: record.farmerStorageLinkId.accountNumber,
    gatePassNo: record.gatePassNo,
    manualGatePassNumber: parseManualGatePassNumber(record.manualParchiNumber),
    manualParchiNumber: record.manualParchiNumber ?? null,
    customMarka: record.customMarka ?? null,
    date: record.date,
    variety: record.variety,
    storageCategory: record.type ?? '',
    bagSizes: record.bagSizes.map(mapBagSize),
    remarks: record.remarks ?? '',
    stockFilter: record.stockFilter,
  };
}

export function incomingGatePassesToStorageGatePasses(
  records: IncomingGatePassRecord[],
  farmerStorageLinkId: string,
): StorageGatePass[] {
  return records
    .map((record) => incomingGatePassToStorageGatePass(record, farmerStorageLinkId))
    .filter((pass) => pass.bagSizes.some((bag) => bag.currentQuantity > 0));
}
