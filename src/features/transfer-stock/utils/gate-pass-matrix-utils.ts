import type { Preferences } from '@/features/auth/types';
import { sumBagQuantities } from '@/features/daybook/utils/format';
import { sortSizeNamesByPreferenceOrder } from '@/features/incoming/utils/incoming-preferences';
import type {
  DatePassGroup,
  LocationFilters,
  StorageGatePass,
  StorageGatePassBagSlot,
  TransferAllocationKey,
  TransferStockItem,
  VoucherSort,
} from '@/features/transfer-stock/types/storage-gate-pass';

export type LotNoPreferences = Pick<Preferences, 'customMarka' | 'markaType'> | null | undefined;

/** Unit separator — size names may contain `|`. */
const KEY_SEP = '\u001f';

export type StorageGatePassFilterParams = {
  variety?: string;
  varieties?: string[];
  search?: string;
  location?: LocationFilters;
  stockFilter?: string;
  preferences?: LotNoPreferences;
};

export function getStorageGatePassLotNo(
  pass: StorageGatePass,
  preferences: LotNoPreferences,
): string {
  if (preferences?.customMarka) {
    const custom = pass.customMarka?.trim();
    if (custom) return custom;
  }

  const totalBags = sumBagQuantities(pass.bagSizes, 'initialQuantity');
  if (totalBags <= 0) return '—';

  const manualParchi = pass.manualParchiNumber?.trim();
  const identifier = manualParchi || String(pass.gatePassNo);
  return `${identifier}/${totalBags}`;
}

function getLotNoSearchTerms(pass: StorageGatePass, preferences: LotNoPreferences): string[] {
  const lotNo = getStorageGatePassLotNo(pass, preferences);
  const terms: string[] = [];

  if (lotNo !== '—') {
    terms.push(lotNo);
    const slashIndex = lotNo.indexOf('/');
    if (slashIndex !== -1) {
      terms.push(lotNo.slice(0, slashIndex));
      terms.push(lotNo.slice(slashIndex + 1));
    }
  }

  const customMarka = pass.customMarka?.trim();
  if (customMarka) {
    terms.push(customMarka);
  }

  return terms;
}

export function filterStorageGatePasses(
  passes: StorageGatePass[],
  { variety, varieties, search, location, stockFilter, preferences }: StorageGatePassFilterParams,
): StorageGatePass[] {
  let list = passes;
  const varietySet =
    varieties != null && varieties.length > 0
      ? new Set(varieties.map((v) => v.trim()).filter(Boolean))
      : null;
  if (varietySet) {
    list = list.filter((p) => {
      const passVariety = p.variety?.trim();
      return passVariety != null && varietySet.has(passVariety);
    });
  } else if (variety?.trim()) {
    const v = variety.trim();
    list = list.filter((p) => p.variety?.trim() === v);
  }
  if (stockFilter?.trim()) {
    const filterValue = stockFilter.trim();
    list = list.filter((p) => p.stockFilter?.trim() === filterValue);
  }
  if (search?.trim()) {
    list = list.filter((p) => passMatchesGatePassSearch(p, search, preferences));
  }
  if (location) {
    list = list.filter((p) => passMatchesLocationFilters(p, location));
  }
  return list;
}

export function allocationKey(
  passId: string,
  sizeName: string,
  bagIndex: number,
): TransferAllocationKey {
  return `${passId}${KEY_SEP}${sizeName}${KEY_SEP}${bagIndex}`;
}

export function parseAllocationKey(key: string): {
  passId: string;
  sizeName: string;
  bagIndex: number;
} | null {
  const parts = key.split(KEY_SEP);
  if (parts.length < 3) return null;
  const bagIndex = Number.parseInt(parts.at(-1) ?? '', 10);
  if (Number.isNaN(bagIndex)) return null;
  const passId = parts[0] ?? '';
  const sizeName = parts.slice(1, -1).join(KEY_SEP);
  if (!passId || !sizeName) return null;
  return { passId, sizeName, bagIndex };
}

export type BagSlotDetail = StorageGatePassBagSlot & { bagIndex: number };

export function getBagSlotsForSize(pass: StorageGatePass, sizeName: string): BagSlotDetail[] {
  const slots: BagSlotDetail[] = [];
  pass.bagSizes.forEach((bag, index) => {
    if (bag.size.trim() === sizeName.trim()) {
      slots.push({ ...bag, bagIndex: index });
    }
  });
  return slots;
}

export function getUniqueSizes(passes: StorageGatePass[], sizeOrder: string[] = []): string[] {
  const names = new Set<string>();
  for (const pass of passes) {
    for (const bag of pass.bagSizes) {
      const name = bag.size?.trim();
      if (name) names.add(name);
    }
  }
  return sortSizeNamesByPreferenceOrder([...names], sizeOrder);
}

export function getUniqueVarieties(passes: StorageGatePass[]): string[] {
  const names = new Set<string>();
  for (const pass of passes) {
    const v = pass.variety?.trim();
    if (v) names.add(v);
  }
  return [...names].sort();
}

export function getUniqueLocationValues(passes: StorageGatePass[]): {
  chambers: string[];
  floors: string[];
  rows: string[];
} {
  const chambers = new Set<string>();
  const floors = new Set<string>();
  const rows = new Set<string>();

  for (const pass of passes) {
    for (const bag of pass.bagSizes) {
      if (bag.chamber?.trim()) chambers.add(bag.chamber.trim());
      if (bag.floor?.trim()) floors.add(bag.floor.trim());
      if (bag.row?.trim()) rows.add(bag.row.trim());
    }
  }

  return {
    chambers: [...chambers].sort(),
    floors: [...floors].sort(),
    rows: [...rows].sort(),
  };
}

export function passMatchesGatePassSearch(
  pass: StorageGatePass,
  search: string,
  preferences: LotNoPreferences = null,
): boolean {
  const q = search.trim().toLowerCase();
  if (!q) return true;
  const gate = String(pass.gatePassNo);
  const manual = pass.manualGatePassNumber != null ? String(pass.manualGatePassNumber) : '';
  const parchi = pass.manualParchiNumber?.trim().toLowerCase() ?? '';
  const lotMatch = getLotNoSearchTerms(pass, preferences).some((term) =>
    term.toLowerCase().includes(q),
  );
  return gate.includes(q) || manual.includes(q) || parchi.includes(q) || lotMatch;
}

export function passMatchesLocationFilters(
  pass: StorageGatePass,
  filters: LocationFilters,
): boolean {
  const { chamber, floor, row } = filters;
  if (!chamber && !floor && !row) return true;

  return pass.bagSizes.some((bag) => {
    if (chamber && bag.chamber?.trim() !== chamber) return false;
    if (floor && bag.floor?.trim() !== floor) return false;
    if (row && bag.row?.trim() !== row) return false;
    return true;
  });
}

function formatGroupDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function groupPassesByDate(passes: StorageGatePass[], sort: VoucherSort): DatePassGroup[] {
  const sorted = [...passes].sort((a, b) => {
    const na = a.gatePassNo ?? 0;
    const nb = b.gatePassNo ?? 0;
    return sort === 'asc' ? na - nb : nb - na;
  });

  const byDate = new Map<string, StorageGatePass[]>();
  for (const pass of sorted) {
    const dateKey = pass.date.slice(0, 10);
    const list = byDate.get(dateKey) ?? [];
    list.push(pass);
    byDate.set(dateKey, list);
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => (sort === 'asc' ? a.localeCompare(b) : b.localeCompare(a)))
    .map(([dateKey, groupPasses]) => ({
      dateKey,
      dateLabel: formatGroupDate(groupPasses[0]?.date ?? dateKey),
      passes: groupPasses,
    }));
}

export function buildAllocationsFromPass(
  pass: StorageGatePass,
  visibleSizes: string[],
): Record<string, number> {
  const next: Record<string, number> = {};
  for (const size of visibleSizes) {
    const details = getBagSlotsForSize(pass, size);
    for (const detail of details) {
      if (detail.currentQuantity > 0) {
        next[allocationKey(pass._id, size, detail.bagIndex)] = detail.currentQuantity;
      }
    }
  }
  return next;
}

export function findPassAndSlot(
  passes: StorageGatePass[],
  passId: string,
  sizeName: string,
  bagIndex: number,
): { pass: StorageGatePass; slot: BagSlotDetail } | null {
  const pass = passes.find((p) => p._id === passId);
  if (!pass) return null;
  const slot = getBagSlotsForSize(pass, sizeName).find((s) => s.bagIndex === bagIndex);
  if (!slot) return null;
  return { pass, slot };
}

export function buildTransferItems(
  allocations: Record<string, number>,
  passes: StorageGatePass[],
): TransferStockItem[] {
  const items: TransferStockItem[] = [];

  for (const [key, quantity] of Object.entries(allocations)) {
    if (quantity <= 0) continue;
    const parsed = parseAllocationKey(key);
    if (!parsed) continue;
    const found = findPassAndSlot(passes, parsed.passId, parsed.sizeName, parsed.bagIndex);
    if (!found) continue;

    items.push({
      storageGatePassId: parsed.passId,
      gatePassNo: found.pass.gatePassNo,
      bagSize: parsed.sizeName,
      bagIndex: parsed.bagIndex,
      quantity,
      location: {
        chamber: found.slot.chamber,
        floor: found.slot.floor,
        row: found.slot.row,
      },
    });
  }

  return items;
}

export function formatLocationShort(slot: StorageGatePassBagSlot): string {
  return `Ch: ${slot.chamber} · F: ${slot.floor} · R: ${slot.row}`;
}

/** Remaining stock vs initial quantity for matrix slot color coding. */
export type SlotStockLevel = 'full' | 'depleted' | 'critical';

const SLOT_STOCK_CRITICAL_MAX_PERCENT = 10;
const SLOT_STOCK_DEPLETED_MAX_PERCENT = 100;

export function getSlotStockLevel(
  currentQuantity: number,
  initialQuantity: number,
): SlotStockLevel {
  if (initialQuantity <= 0 || currentQuantity >= initialQuantity) {
    return 'full';
  }

  const percentRemaining = (currentQuantity / initialQuantity) * 100;

  if (percentRemaining < SLOT_STOCK_CRITICAL_MAX_PERCENT) {
    return 'critical';
  }

  if (percentRemaining < SLOT_STOCK_DEPLETED_MAX_PERCENT) {
    return 'depleted';
  }

  return 'full';
}

export function slotStockLevelButtonClasses(
  level: SlotStockLevel,
  isSelected: boolean,
): string | undefined {
  if (isSelected || level === 'full') {
    return undefined;
  }

  if (level === 'critical') {
    return 'border-destructive/45 bg-destructive/[0.04] hover:bg-destructive/[0.06]';
  }

  return 'border-chart-3/50 bg-chart-3/[0.05] hover:bg-chart-3/[0.08]';
}

export function isSlotUnavailable(currentQuantity: number): boolean {
  return currentQuantity <= 0;
}

export function slotUnavailableButtonClasses(): string {
  return 'border-dashed border-border/70 bg-muted/25 text-muted-foreground shadow-none hover:bg-muted/25 disabled:opacity-100';
}

export function totalAllocatedBags(allocations: Record<string, number>): number {
  return Object.values(allocations).reduce((sum, q) => sum + (q > 0 ? q : 0), 0);
}
