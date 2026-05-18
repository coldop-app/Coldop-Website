import type {
  IncomingGatePassItem,
  IncomingGatePassBagSizeLocation,
} from '@/services/incoming-gate-pass/useGetIncomingGatePassesOfSingleFarmer';
import type {
  DaybookEntry,
  DaybookIncomingGatePassSnapshot,
} from '@/services/store-admin/functions/useGetDaybook';
import { formatOutgoingLocation } from '@/lib/outgoing-gate-pass-breakdown';

export interface OutgoingEditRestore {
  snapshotPasses: IncomingGatePassItem[];
  initialSelectedPassIds: string[];
  /** Pre-selected variety in the filter (first issuance variety when multiple). */
  initialVarietyFilter?: string;
  /** Varieties that were part of the original outgoing order. */
  issuanceVarieties?: string[];
  /** When true, table shows only passes from the original issuance. */
  issuanceOnly?: boolean;
  skipVarietyRequirement?: boolean;
}

/** Resolve the variety to pre-select for edit restore. */
export function getInitialVarietyFilterForEntry(
  entry: DaybookEntry,
  issuanceVarieties: string[]
): string {
  if (issuanceVarieties.length === 1) return issuanceVarieties[0]!;
  const topLevel = entry.variety?.trim();
  if (topLevel && issuanceVarieties.includes(topLevel)) return topLevel;
  return issuanceVarieties[0] ?? '';
}

function orderDetailLocationKey(
  size: string,
  location?: { chamber?: string; floor?: string; row?: string }
): string {
  return `${size.trim()}|${formatOutgoingLocation(location)}`;
}

/** Delimiter for allocation map keys (passId + sizeName + optional bagIndex). Use so size names with '-' parse correctly. */
export const ALLOCATION_KEY_DELIMITER = '::';

/**
 * Allocation key for one (pass, size) slot. When an incoming pass has multiple bag entries
 * for the same size (e.g. same size at 2 locations), bagIndex distinguishes them (0, 1, …).
 */
export function allocationKey(
  passId: string,
  sizeName: string,
  bagIndex: number = 0
): string {
  return `${passId}${ALLOCATION_KEY_DELIMITER}${sizeName}${ALLOCATION_KEY_DELIMITER}${bagIndex}`;
}

/** Parse allocation key into passId, sizeName, bagIndex. Handles legacy keys with no bagIndex (treated as 0). */
export function parseAllocationKey(key: string): {
  passId: string;
  sizeName: string;
  bagIndex: number;
} | null {
  const parts = key.split(ALLOCATION_KEY_DELIMITER);
  if (parts.length < 2) return null;
  const passId = parts[0]!;
  const bagIndex =
    parts.length >= 3 ? parseInt(parts[parts.length - 1]!, 10) : 0;
  const sizeName =
    parts.length >= 3
      ? parts.slice(1, -1).join(ALLOCATION_KEY_DELIMITER)
      : parts[1]!;
  return {
    passId,
    sizeName,
    bagIndex: Number.isNaN(bagIndex) ? 0 : bagIndex,
  };
}

export interface IncomingGatePassDisplayGroup {
  groupKey: string;
  groupLabel: string;
  passes: IncomingGatePassItem[];
}

export interface LocationFilters {
  chamber: string;
  floor: string;
  row: string;
}

/** Format an ISO date string for display (e.g. "2026-02-11T00:00:00.000Z" → "11 Feb 2026"). */
export function formatGroupDate(isoDate: string): string {
  if (!isoDate?.trim()) return 'No date';
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Group incoming gate passes by date; each group is sorted by gatePassNo. */
export function groupIncomingPassesByDate(
  passes: IncomingGatePassItem[],
  voucherSort: 'asc' | 'desc'
): IncomingGatePassDisplayGroup[] {
  const byDate = new Map<string, IncomingGatePassItem[]>();
  for (const p of passes) {
    const key = p.date ?? '';
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key)!.push(p);
  }
  const sortedDates = [...byDate.keys()].sort();
  return sortedDates.map((date) => {
    const groupPasses = byDate.get(date)!;
    const sorted = [...groupPasses].sort((a, b) => {
      const na = a.gatePassNo ?? 0;
      const nb = b.gatePassNo ?? 0;
      return voucherSort === 'asc' ? na - nb : nb - na;
    });
    return {
      groupKey: date,
      groupLabel: formatGroupDate(date),
      passes: sorted,
    };
  });
}

/** Single bag slot detail (one row in bagSizes with matching size). */
export interface BagDetailForSize {
  initialQuantity: number;
  currentQuantity: number;
  location?: IncomingGatePassBagSizeLocation;
  /** Index among bags with this size in the pass (0, 1, …). */
  bagIndex: number;
}

/** Get the first bag detail for a given size (backward compat). */
export function getBagDetailForSize(
  pass: IncomingGatePassItem,
  sizeName: string
): {
  initialQuantity: number;
  currentQuantity: number;
  location?: IncomingGatePassBagSizeLocation;
} | null {
  const first = getBagDetailsForSize(pass, sizeName)[0];
  if (!first) return null;
  return {
    initialQuantity: first.initialQuantity,
    currentQuantity: first.currentQuantity,
    location: first.location,
  };
}

/** Get all bag details for a given size. When an incoming order has the same size at multiple locations, returns one entry per location so the user can choose from which to extract. */
export function getBagDetailsForSize(
  pass: IncomingGatePassItem,
  sizeName: string
): BagDetailForSize[] {
  const trimmed = sizeName.trim();
  const bags =
    pass.bagSizes?.filter((b) => (b?.name ?? '').trim() === trimmed) ?? [];
  return bags.map((bag, index) => ({
    initialQuantity: bag.initialQuantity,
    currentQuantity: bag.currentQuantity,
    location: bag.location,
    bagIndex: index,
  }));
}

/** Collect unique chamber, floor, row values from all bag sizes across passes. */
export function getUniqueLocationValues(passes: IncomingGatePassItem[]): {
  chambers: string[];
  floors: string[];
  rows: string[];
} {
  const chambers = new Set<string>();
  const floors = new Set<string>();
  const rows = new Set<string>();
  for (const p of passes) {
    for (const bag of p.bagSizes ?? []) {
      const loc = bag?.location;
      if (loc?.chamber?.trim()) chambers.add(loc.chamber.trim());
      if (loc?.floor?.trim()) floors.add(loc.floor.trim());
      if (loc?.row?.trim()) rows.add(loc.row.trim());
    }
  }
  return {
    chambers: [...chambers].sort(),
    floors: [...floors].sort(),
    rows: [...rows].sort(),
  };
}

/** True if pass has at least one bag matching all non-empty location filters. */
export function passMatchesLocationFilters(
  pass: IncomingGatePassItem,
  filters: LocationFilters
): boolean {
  const hasChamber = filters.chamber.trim() !== '';
  const hasFloor = filters.floor.trim() !== '';
  const hasRow = filters.row.trim() !== '';
  if (!hasChamber && !hasFloor && !hasRow) return true;

  for (const bag of pass.bagSizes ?? []) {
    const loc = bag?.location;
    if (!loc) continue;
    if (hasChamber && (loc.chamber ?? '').trim() !== filters.chamber.trim())
      continue;
    if (hasFloor && (loc.floor ?? '').trim() !== filters.floor.trim()) continue;
    if (hasRow && (loc.row ?? '').trim() !== filters.row.trim()) continue;
    return true;
  }
  return false;
}

/** Single row for edit-mode allocations (ref voucher, size, location, quantity). */
export interface EditAllocationRow {
  key: string;
  passId: string;
  gatePassNo: number;
  size: string;
  location: string;
  quantityIssued: number;
}

/** Map daybook snapshots to incoming gate pass items (issuance-time bag layout). */
export function snapshotsToIncomingGatePassItems(
  snapshots: DaybookIncomingGatePassSnapshot[]
): IncomingGatePassItem[] {
  return snapshots.map((snap) => ({
    _id: snap._id,
    gatePassNo: snap.gatePassNo,
    variety: snap.variety ?? '',
    bagSizes: (snap.bagSizes ?? []).map((b) => ({
      name: b.name,
      initialQuantity: b.initialQuantity ?? 0,
      currentQuantity: b.currentQuantity ?? 0,
      location: {
        chamber: b.location?.chamber ?? '',
        floor: b.location?.floor ?? '',
        row: b.location?.row ?? '',
      },
    })),
    date: '',
    type: 'RECEIPT' as const,
    farmerStorageLinkId: {
      name: '',
      accountNumber: 0,
      address: '',
      mobileNumber: '',
    },
    createdBy: { _id: '', name: '' },
    truckNumber: '',
    status: '',
    remarks: '',
    manualParchiNumber: '',
    createdAt: '',
    updatedAt: '',
  }));
}

/** Union live farmer passes with snapshot passes; live wins when present, snapshot fills gaps. */
export function mergePassesForEdit(
  livePasses: IncomingGatePassItem[],
  snapshotItems: IncomingGatePassItem[]
): IncomingGatePassItem[] {
  const byId = new Map(livePasses.map((p) => [p._id, p]));
  for (const snap of snapshotItems) {
    if (!byId.has(snap._id)) {
      byId.set(snap._id, snap);
    }
  }
  return [...byId.values()];
}

/** Pass IDs that were part of the original outgoing order. */
export function getInitialSelectedPassIds(entry: DaybookEntry): string[] {
  const fromSnapshots = (entry.incomingGatePassSnapshots ?? []).map((s) => s._id);
  const fromEntries = (entry.incomingGatePassEntries ?? []).map(
    (e) => e.incomingGatePassId
  );
  return [...new Set([...fromSnapshots, ...fromEntries])];
}

/** Build allocation key -> quantity from a daybook outgoing entry (for edit form initial state). */
export function buildInitialAllocationsFromEntry(
  entry: DaybookEntry | null | undefined
): Record<string, number> {
  if (!entry) return {};

  const result: Record<string, number> = {};
  const snapshots = entry.incomingGatePassSnapshots ?? [];
  const incomingEntries = entry.incomingGatePassEntries ?? [];

  if (incomingEntries.length > 0) {
    for (const ent of incomingEntries) {
      const passId = ent.incomingGatePassId;
      const sizeToNextIndex = new Map<string, number>();
      for (const alloc of ent.allocations ?? []) {
        const size = (alloc.size ?? '').trim();
        const qty = alloc.quantityToAllocate ?? 0;
        if (!size || qty <= 0) continue;
        const bagIndex = sizeToNextIndex.get(size) ?? 0;
        sizeToNextIndex.set(size, bagIndex + 1);
        result[allocationKey(passId, size, bagIndex)] = qty;
      }
    }
    if (Object.keys(result).length > 0) return result;
  }

  if (snapshots.length > 0) {
    const orderDetails = entry.orderDetails ?? [];
    const quantitiesByLocation = new Map<string, number>();
    for (const od of orderDetails) {
      const size = (od.size ?? '').trim();
      if (!size) continue;
      const key = orderDetailLocationKey(size, od.location);
      quantitiesByLocation.set(key, od.quantityIssued ?? 0);
    }

    for (const snap of snapshots) {
      const sizeToIndex = new Map<string, number>();
      for (const bag of snap.bagSizes ?? []) {
        const size = (bag.name ?? '').trim();
        if (!size) continue;
        const bagIndex = sizeToIndex.get(size) ?? 0;
        sizeToIndex.set(size, bagIndex + 1);
        const qty =
          quantitiesByLocation.get(orderDetailLocationKey(size, bag.location)) ??
          0;
        if (qty > 0) {
          result[allocationKey(snap._id, size, bagIndex)] = qty;
        }
      }
    }
    return result;
  }

  const orderDetails = entry.orderDetails ?? [];
  for (const od of orderDetails) {
    const qty = od.quantityIssued ?? 0;
    if (qty <= 0) continue;
    const size = (od.size ?? '').trim();
    if (!size) continue;
    const passNo = od.incomingGatePassNo ?? od.gatePassNumber;
    const snapshot =
      passNo != null
        ? snapshots.find((s) => s.gatePassNo === passNo)
        : snapshots.find((s) =>
            s.bagSizes?.some((b) => (b.name ?? '').trim() === size)
          );
    const passId = snapshot?._id;
    const bagIndex = (od as { bagIndex?: number }).bagIndex ?? 0;
    if (passId) result[allocationKey(passId, size, bagIndex)] = qty;
  }
  return result;
}

/** Build edit restore config from a daybook entry. */
export function buildEditRestoreFromEntry(
  entry: DaybookEntry
): OutgoingEditRestore | undefined {
  const snapshots = entry.incomingGatePassSnapshots ?? [];
  if (snapshots.length === 0 && !(entry.incomingGatePassEntries?.length)) {
    return undefined;
  }
  const snapshotPasses = snapshotsToIncomingGatePassItems(snapshots);
  const varieties = new Set<string>();
  for (const s of snapshots) {
    const v = s.variety?.trim();
    if (v) varieties.add(v);
  }
  for (const e of entry.incomingGatePassEntries ?? []) {
    const v = e.variety?.trim();
    if (v) varieties.add(v);
  }
  const varietyList = [...varieties].sort();
  return {
    snapshotPasses,
    initialSelectedPassIds: getInitialSelectedPassIds(entry),
    initialVarietyFilter: getInitialVarietyFilterForEntry(entry, varietyList),
    issuanceVarieties: varietyList,
    issuanceOnly: false,
    skipVarietyRequirement: true,
  };
}

/** Build display rows for edit allocations from entry + current cellRemovedQuantities. One row per (pass, size, location) so multiple locations for same size are shown. */
export function getEditAllocationRows(
  entry: DaybookEntry | null | undefined,
  cellRemovedQuantities: Record<string, number>
): EditAllocationRow[] {
  if (!entry?.incomingGatePassSnapshots?.length) return [];
  const snapshots = entry.incomingGatePassSnapshots;
  const rows: EditAllocationRow[] = [];
  for (const snap of snapshots) {
    const sizeToIndex = new Map<string, number>();
    for (const bag of snap.bagSizes ?? []) {
      const size = (bag.name ?? '').trim();
      if (!size) continue;
      const bagIndex = sizeToIndex.get(size) ?? 0;
      sizeToIndex.set(size, bagIndex + 1);
      const key = allocationKey(snap._id, size, bagIndex);
      const qty = cellRemovedQuantities[key] ?? 0;
      if (qty <= 0) continue;
      const loc = bag.location;
      const locationStr = loc
        ? [loc.chamber, loc.floor, loc.row].filter(Boolean).join(' · ') || '—'
        : '—';
      rows.push({
        key,
        passId: snap._id,
        gatePassNo: snap.gatePassNo,
        size,
        location: locationStr,
        quantityIssued: qty,
      });
    }
  }
  return rows;
}
