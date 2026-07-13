import type {
  DaybookLocation,
  IncomingGatePassSnapshot,
  OutgoingSnapshotBagSize,
} from '@/features/daybook/types';
import { locationKey } from '@/features/daybook/utils/format';
import type {
  StorageGatePass,
  StorageGatePassBagSlot,
} from '@/features/transfer-stock/types/storage-gate-pass';
import { getBagSlotsForSize } from '@/features/transfer-stock/utils/gate-pass-matrix-utils';

function snapshotBagToSlot(
  bag: OutgoingSnapshotBagSize,
  currentQuantity: number,
): StorageGatePassBagSlot {
  return {
    size: bag.name,
    currentQuantity,
    initialQuantity: bag.initialQuantity,
    bagType: bag.type ?? '',
    chamber: bag.location?.chamber ?? '',
    floor: bag.location?.floor ?? '',
    row: bag.location?.row ?? '',
  };
}

function slotLocationKey(slot: { chamber: string; floor: string; row: string }): string {
  return `${slot.chamber?.trim() ?? ''}\u001f${slot.floor?.trim() ?? ''}\u001f${slot.row?.trim() ?? ''}`;
}

function findMatchingBagIndex(
  pass: StorageGatePass,
  sizeName: string,
  location: DaybookLocation,
): number | null {
  const targetKey = locationKey(location);
  const slots = getBagSlotsForSize(pass, sizeName);

  for (const slot of slots) {
    if (slotLocationKey(slot) === targetKey) {
      return slot.bagIndex;
    }
  }

  return null;
}

export function snapshotToStorageGatePass(
  snapshot: IncomingGatePassSnapshot,
  farmerStorageLinkId: string,
  accountNumber: number,
  date = new Date(0).toISOString(),
): StorageGatePass {
  return {
    _id: snapshot._id,
    farmerStorageLinkId,
    accountNumber,
    gatePassNo: snapshot.gatePassNo,
    date,
    variety: snapshot.variety,
    storageCategory: '',
    bagSizes: snapshot.bagSizes.map((bag) => snapshotBagToSlot(bag, 0)),
    remarks: '',
  };
}

function mergeSnapshotIntoPass(
  livePass: StorageGatePass,
  snapshot: IncomingGatePassSnapshot,
): StorageGatePass {
  const bagSizes = [...livePass.bagSizes];

  for (const bag of snapshot.bagSizes) {
    const existingIndex = findMatchingBagIndex(livePass, bag.name, bag.location);
    if (existingIndex != null) continue;

    bagSizes.push(snapshotBagToSlot(bag, 0));
  }

  return { ...livePass, bagSizes };
}

export function mergeOutgoingSnapshotPasses(
  livePasses: StorageGatePass[],
  snapshots: IncomingGatePassSnapshot[],
  farmerStorageLinkId: string,
  accountNumber: number,
): StorageGatePass[] {
  if (snapshots.length === 0) return livePasses;

  const byId = new Map(livePasses.map((pass) => [pass._id, pass]));

  for (const snapshot of snapshots) {
    const existing = byId.get(snapshot._id);

    if (existing) {
      byId.set(snapshot._id, mergeSnapshotIntoPass(existing, snapshot));
      continue;
    }

    byId.set(snapshot._id, snapshotToStorageGatePass(snapshot, farmerStorageLinkId, accountNumber));
  }

  return [...byId.values()];
}
