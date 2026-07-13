import type { Preferences } from '@/features/auth/types';
import type { IncomingDaybookEntry } from '@/features/daybook/types';
import {
  formatCompactLocation,
  formatDaybookDate,
  formatManualParchi,
  sumBagQuantities,
} from '@/features/daybook/utils/format';
import {
  getBagSizeOrderForVariety,
  sortByPreferenceOrder,
} from '@/features/incoming/utils/incoming-preferences';

export type IncomingGatePassReceiptBagRow = {
  bagSize: string;
  location: string;
  currentQty: number;
  initialQty: number;
};

export type IncomingGatePassReceiptPdfData = {
  gatePassLabel: string;
  manualParchi: string | null;
  accountNo: string;
  farmerName: string;
  variety: string;
  date: string;
  totalBags: number;
  totalInitialQuantity: number;
  totalCurrentQuantity: number;
  createdBy: string;
  truckNo: string | null;
  bagRows: IncomingGatePassReceiptBagRow[];
  remarks: string | null;
};

export type BuildIncomingGatePassPdfDataInput = {
  entry: IncomingDaybookEntry;
  preferences: Pick<Preferences, 'commodities' | 'customMarka' | 'markaType'> | null;
};

export function buildIncomingGatePassPdfData({
  entry,
  preferences,
}: BuildIncomingGatePassPdfDataInput): IncomingGatePassReceiptPdfData {
  const sizes = entry.bagSizes ?? [];
  const sizeOrder = getBagSizeOrderForVariety(preferences?.commodities ?? [], entry.variety);
  const bagSizes = sortByPreferenceOrder(sizes, sizeOrder);
  const totalInitialQuantity = sumBagQuantities(bagSizes, 'initialQuantity');
  const totalCurrentQuantity = sumBagQuantities(bagSizes, 'currentQuantity');
  const farmerLink = entry.farmerStorageLinkId;
  const rawParchi = formatManualParchi(entry.manualParchiNumber);
  const remarks = entry.remarks?.trim() || null;

  return {
    gatePassLabel: `IGP #${entry.gatePassNo}`,
    manualParchi: rawParchi !== '—' ? `#${rawParchi}` : null,
    accountNo: `#${farmerLink.accountNumber.toLocaleString('en-IN')}`,
    farmerName: farmerLink.name,
    variety: entry.variety,
    date: formatDaybookDate(entry.createdAt),
    totalBags: totalInitialQuantity,
    totalInitialQuantity,
    totalCurrentQuantity,
    createdBy: entry.createdBy?.name ?? '—',
    truckNo: entry.truckNumber?.trim() ? entry.truckNumber.trim().toUpperCase() : null,
    bagRows: bagSizes.map((bag) => ({
      bagSize: bag.name,
      location: formatCompactLocation(bag.location),
      currentQty: bag.currentQuantity,
      initialQty: bag.initialQuantity,
    })),
    remarks,
  };
}
