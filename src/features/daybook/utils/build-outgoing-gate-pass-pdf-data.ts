import type {
  IncomingGatePassSnapshot,
  OutgoingDaybookEntry,
  OutgoingOrderDetail,
} from '@/features/daybook/types';
import {
  formatCompactLocation,
  formatDaybookDate,
  formatManualParchi,
  locationKey,
  sumBagQuantities,
} from '@/features/daybook/utils/format';

export type OutgoingGatePassReceiptLineRow = {
  bagSize: string;
  variety: string;
  location: string;
  refGatePassNo: number | null;
  availableQty: number;
  issuedQty: number;
};

export type OutgoingGatePassReceiptPdfData = {
  gatePassLabel: string;
  manualParchi: string | null;
  accountNo: string;
  farmerName: string;
  variety: string;
  date: string;
  createdBy: string;
  truckNo: string | null;
  fromLocation: string | null;
  toLocation: string | null;
  isNull: boolean;
  nulledBy: string | null;
  orderRows: OutgoingGatePassReceiptLineRow[];
  totalAvailable: number;
  totalIssued: number;
  remarks: string | null;
};

export type BuildOutgoingGatePassPdfDataInput = {
  entry: OutgoingDaybookEntry;
};

function findSnapshotForOrderLine(
  snapshots: IncomingGatePassSnapshot[],
  orderLine: OutgoingOrderDetail,
): IncomingGatePassSnapshot | undefined {
  const key = `${orderLine.size}\u001f${locationKey(orderLine.location)}`;

  return snapshots.find((snapshot) =>
    snapshot.bagSizes.some((bag) => `${bag.name}\u001f${locationKey(bag.location)}` === key),
  );
}

export function buildOutgoingGatePassPdfData({
  entry,
}: BuildOutgoingGatePassPdfDataInput): OutgoingGatePassReceiptPdfData {
  const orderDetails = entry.orderDetails ?? [];
  const snapshots = entry.incomingGatePassSnapshots ?? [];
  const farmerLink = entry.farmerStorageLinkId;
  const rawParchi = formatManualParchi(entry.manualParchiNumber);
  const remarks = entry.remarks?.trim() || null;
  const primaryVariety = entry.variety ?? snapshots[0]?.variety ?? '—';

  const orderRows = orderDetails.map((orderLine) => {
    const snapshot = findSnapshotForOrderLine(snapshots, orderLine);

    return {
      bagSize: orderLine.size,
      variety: snapshot?.variety ?? '—',
      location: formatCompactLocation(orderLine.location),
      refGatePassNo: snapshot?.gatePassNo ?? null,
      availableQty: orderLine.quantityAvailable,
      issuedQty: orderLine.quantityIssued,
    };
  });

  return {
    gatePassLabel: `OGP #${entry.gatePassNo}`,
    manualParchi: rawParchi !== '—' ? `#${rawParchi}` : null,
    accountNo: `#${farmerLink.accountNumber.toLocaleString('en-IN')}`,
    farmerName: farmerLink.name,
    variety: primaryVariety,
    date: formatDaybookDate(entry.createdAt),
    createdBy: entry.createdBy?.name ?? '—',
    truckNo: entry.truckNumber?.trim() ? entry.truckNumber.trim().toUpperCase() : null,
    fromLocation: entry.from?.trim() || null,
    toLocation: entry.to?.trim() || null,
    isNull: entry.isNull === true,
    nulledBy: entry.nulledBy?.name ?? null,
    orderRows,
    totalAvailable: sumBagQuantities(orderDetails, 'quantityAvailable'),
    totalIssued: sumBagQuantities(orderDetails, 'quantityIssued'),
    remarks,
  };
}
