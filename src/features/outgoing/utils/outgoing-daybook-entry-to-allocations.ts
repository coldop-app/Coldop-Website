import type {
  IncomingGatePassSnapshot,
  OutgoingDaybookEntry,
  OutgoingOrderDetail,
} from '@/features/daybook/types';
import { locationKey } from '@/features/daybook/utils/format';
import type { StorageGatePass } from '@/features/transfer-stock/types/storage-gate-pass';
import {
  allocationKey,
  getBagSlotsForSize,
} from '@/features/transfer-stock/utils/gate-pass-matrix-utils';

export type OutgoingEntryAllocations = {
  allocations: Record<string, number>;
  baselineAllocations: Record<string, number>;
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

function findBagIndexForOrderLine(
  pass: StorageGatePass,
  orderLine: OutgoingOrderDetail,
): number | null {
  const slots = getBagSlotsForSize(pass, orderLine.size);
  const targetKey = locationKey(orderLine.location);

  for (const slot of slots) {
    const slotKey = `${slot.chamber?.trim() ?? ''}\u001f${slot.floor?.trim() ?? ''}\u001f${slot.row?.trim() ?? ''}`;
    if (slotKey === targetKey) {
      return slot.bagIndex;
    }
  }

  return null;
}

function findBagIndexInSnapshot(
  snapshot: IncomingGatePassSnapshot,
  orderLine: OutgoingOrderDetail,
): number | null {
  const targetKey = `${orderLine.size}\u001f${locationKey(orderLine.location)}`;

  for (const [index, bag] of snapshot.bagSizes.entries()) {
    if (`${bag.name}\u001f${locationKey(bag.location)}` === targetKey) {
      return index;
    }
  }

  return null;
}

export function outgoingDaybookEntryToAllocations(
  entry: OutgoingDaybookEntry,
  passes: StorageGatePass[],
): OutgoingEntryAllocations {
  const allocations: Record<string, number> = {};
  const orderDetails = entry.orderDetails ?? [];
  const snapshots = entry.incomingGatePassSnapshots ?? [];

  for (const orderLine of orderDetails) {
    const snapshot = findSnapshotForOrderLine(snapshots, orderLine);
    if (!snapshot) continue;

    const pass = passes.find((candidate) => candidate._id === snapshot._id);
    let bagIndex = pass ? findBagIndexForOrderLine(pass, orderLine) : null;
    if (bagIndex == null) {
      bagIndex = findBagIndexInSnapshot(snapshot, orderLine);
    }

    if (bagIndex == null) continue;

    const key = allocationKey(snapshot._id, orderLine.size, bagIndex);
    allocations[key] = orderLine.quantityIssued;
  }

  return {
    allocations,
    baselineAllocations: { ...allocations },
  };
}
