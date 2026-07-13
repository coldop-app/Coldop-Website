import type { CommodityPreference } from '@/features/auth/types';
import type {
  DaybookEntry,
  DaybookLocation,
  IncomingDaybookEntry,
  IncomingGatePassSnapshot,
  OutgoingDaybookEntry,
  OutgoingOrderDetail,
} from '@/features/daybook/types';
import { isOutgoingDaybookEntry } from '@/features/daybook/types';
import { formatManualParchi, locationKey } from '@/features/daybook/utils/format';
import { getMergedBagSizeOrder } from '@/features/incoming/utils/incoming-preferences';

export type StockQuantityMode = 'current' | 'initial' | 'outgoing';

export type StockFilterTab = 'all' | string;

export type StockSummaryRow = {
  variety: string;
  bySize: Record<string, number>;
  total: number;
};

export type StockSummaryMatrix = {
  sizeColumns: string[];
  rows: StockSummaryRow[];
  footerBySize: Record<string, number>;
  grandTotal: number;
  modeTotals: Record<StockQuantityMode, number>;
};

export type StockSummaryBreakdownLine = {
  variety: string;
  size: string;
  location: string;
  quantity: number;
  gatePassNo: number;
  reference?: string;
  manualParchiNumber?: string;
  manualGatePassNumber?: string;
};

export type BuildFarmerStockSummaryInput = {
  passes: IncomingDaybookEntry[];
  commodities: CommodityPreference[];
  stockFilterTab: StockFilterTab;
  quantityMode: StockQuantityMode;
};

export type BuildStockSummaryCellBreakdownInput = {
  passes: IncomingDaybookEntry[];
  outgoingPasses?: OutgoingDaybookEntry[];
  allEntries?: DaybookEntry[];
  stockFilterTab: StockFilterTab;
  quantityMode: StockQuantityMode;
  variety: string;
  size: string;
};

function getQuantityForMode(
  initialQuantity: number,
  currentQuantity: number,
  mode: StockQuantityMode,
): number {
  switch (mode) {
    case 'current':
      return currentQuantity;
    case 'initial':
      return initialQuantity;
    case 'outgoing':
      return Math.max(initialQuantity - currentQuantity, 0);
  }
}

export function formatStockSummaryLocation(location: DaybookLocation): string {
  return `${location.chamber}/${location.floor}/${location.row}`;
}

function findSnapshotForOrderLine(
  snapshots: IncomingGatePassSnapshot[],
  orderLine: OutgoingOrderDetail,
): IncomingGatePassSnapshot | undefined {
  const key = `${orderLine.size}\u001f${locationKey(orderLine.location)}`;

  return snapshots.find((snapshot) =>
    snapshot.bagSizes.some((bag) => `${bag.name}\u001f${locationKey(bag.location)}` === key),
  );
}

function sortStockSummaryBreakdownLines(
  lines: StockSummaryBreakdownLine[],
): StockSummaryBreakdownLine[] {
  return lines.sort((a, b) => {
    const passDiff = a.gatePassNo - b.gatePassNo;
    if (passDiff !== 0) return passDiff;
    return a.location.localeCompare(b.location);
  });
}

function resolveOutgoingPasses(input: BuildStockSummaryCellBreakdownInput): OutgoingDaybookEntry[] {
  if (input.outgoingPasses?.length) return input.outgoingPasses;
  if (!input.allEntries?.length) return [];
  return input.allEntries.filter(isOutgoingDaybookEntry);
}

function buildOutgoingStockSummaryCellBreakdown(
  input: BuildStockSummaryCellBreakdownInput,
): StockSummaryBreakdownLine[] {
  const { passes, stockFilterTab, variety, size } = input;
  const outgoingPasses = resolveOutgoingPasses(input);
  const filteredIncomingIds =
    stockFilterTab === 'all'
      ? null
      : new Set(filterPassesByStockFilter(passes, stockFilterTab).map((pass) => pass._id));
  const normalizedSize = size.trim();
  const lines: StockSummaryBreakdownLine[] = [];

  for (const pass of outgoingPasses) {
    if (pass.isNull === true) continue;

    const snapshots = pass.incomingGatePassSnapshots ?? [];

    for (const orderLine of pass.orderDetails ?? []) {
      if (orderLine.size.trim() !== normalizedSize) continue;
      if (orderLine.quantityIssued <= 0) continue;

      const snapshot = findSnapshotForOrderLine(snapshots, orderLine);
      const lineVariety = snapshot?.variety?.trim() || pass.variety?.trim() || '—';
      if (lineVariety !== variety) continue;

      if (filteredIncomingIds) {
        if (!snapshot || !filteredIncomingIds.has(snapshot._id)) continue;
      }

      const manualGatePass = formatManualParchi(pass.manualParchiNumber);

      lines.push({
        variety: lineVariety,
        size: normalizedSize,
        location: formatStockSummaryLocation(orderLine.location),
        quantity: orderLine.quantityIssued,
        gatePassNo: pass.gatePassNo,
        reference: snapshot?.gatePassNo != null ? String(snapshot.gatePassNo) : undefined,
        ...(manualGatePass !== '—' ? { manualGatePassNumber: manualGatePass } : {}),
      });
    }
  }

  return sortStockSummaryBreakdownLines(lines);
}

export function buildStockSummaryCellBreakdown(
  input: BuildStockSummaryCellBreakdownInput,
): StockSummaryBreakdownLine[] {
  const { passes, stockFilterTab, quantityMode, variety, size } = input;

  if (quantityMode === 'outgoing') {
    return buildOutgoingStockSummaryCellBreakdown(input);
  }

  const filteredPasses = filterPassesByStockFilter(passes, stockFilterTab);
  const normalizedSize = size.trim();
  const lines: StockSummaryBreakdownLine[] = [];

  for (const pass of filteredPasses) {
    const passVariety = pass.variety.trim() || '—';
    if (passVariety !== variety) continue;

    for (const bagSize of pass.bagSizes ?? []) {
      if (bagSize.name.trim() !== normalizedSize) continue;

      const quantity = getQuantityForMode(
        bagSize.initialQuantity,
        bagSize.currentQuantity,
        quantityMode,
      );
      if (quantity <= 0) continue;

      const manualParchi = formatManualParchi(pass.manualParchiNumber);

      lines.push({
        variety: passVariety,
        size: normalizedSize,
        location: formatStockSummaryLocation(bagSize.location),
        quantity,
        gatePassNo: pass.gatePassNo,
        ...(manualParchi !== '—' ? { manualParchiNumber: manualParchi } : {}),
      });
    }
  }

  return sortStockSummaryBreakdownLines(lines);
}

export function filterPassesByStockFilter(
  passes: IncomingDaybookEntry[],
  stockFilterTab: StockFilterTab,
): IncomingDaybookEntry[] {
  if (stockFilterTab === 'all') return passes;

  return passes.filter((pass) => pass.stockFilter === stockFilterTab);
}

function collectSizeNamesFromPasses(passes: IncomingDaybookEntry[]): string[] {
  const seen = new Set<string>();
  const sizes: string[] = [];

  for (const pass of passes) {
    for (const bagSize of pass.bagSizes ?? []) {
      const name = bagSize.name.trim();
      if (!name || seen.has(name)) continue;
      seen.add(name);
      sizes.push(name);
    }
  }

  return sizes;
}

export function resolveSizeColumns(
  passes: IncomingDaybookEntry[],
  commodities: CommodityPreference[],
): string[] {
  const preferredOrder = getMergedBagSizeOrder(commodities);
  const dataSizes = collectSizeNamesFromPasses(passes);
  const preferredSet = new Set(preferredOrder);
  const extraSizes = dataSizes.filter((size) => !preferredSet.has(size));

  return [...preferredOrder, ...extraSizes];
}

function buildMatrixForMode(
  passes: IncomingDaybookEntry[],
  sizeColumns: string[],
  mode: StockQuantityMode,
): Pick<StockSummaryMatrix, 'rows' | 'footerBySize' | 'grandTotal'> {
  const varietyMap = new Map<string, Record<string, number>>();

  for (const pass of passes) {
    const variety = pass.variety.trim() || '—';

    for (const bagSize of pass.bagSizes ?? []) {
      const sizeName = bagSize.name.trim();
      if (!sizeName) continue;

      const quantity = getQuantityForMode(bagSize.initialQuantity, bagSize.currentQuantity, mode);

      const bySize = varietyMap.get(variety) ?? {};
      bySize[sizeName] = (bySize[sizeName] ?? 0) + quantity;
      varietyMap.set(variety, bySize);
    }
  }

  const rows: StockSummaryRow[] = [...varietyMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([variety, bySize]) => {
      const normalizedBySize = Object.fromEntries(
        sizeColumns.map((size) => [size, bySize[size] ?? 0]),
      );
      const total = sizeColumns.reduce((sum, size) => sum + (normalizedBySize[size] ?? 0), 0);

      return { variety, bySize: normalizedBySize, total };
    });

  const footerBySize = Object.fromEntries(
    sizeColumns.map((size) => [size, rows.reduce((sum, row) => sum + (row.bySize[size] ?? 0), 0)]),
  );

  const grandTotal = rows.reduce((sum, row) => sum + row.total, 0);

  return { rows, footerBySize, grandTotal };
}

export function buildFarmerStockSummary({
  passes,
  commodities,
  stockFilterTab,
  quantityMode,
}: BuildFarmerStockSummaryInput): StockSummaryMatrix {
  const filteredPasses = filterPassesByStockFilter(passes, stockFilterTab);
  const sizeColumns = resolveSizeColumns(filteredPasses, commodities);

  const modeTotals = {
    current: buildMatrixForMode(filteredPasses, sizeColumns, 'current').grandTotal,
    initial: buildMatrixForMode(filteredPasses, sizeColumns, 'initial').grandTotal,
    outgoing: buildMatrixForMode(filteredPasses, sizeColumns, 'outgoing').grandTotal,
  };

  const { rows, footerBySize, grandTotal } = buildMatrixForMode(
    filteredPasses,
    sizeColumns,
    quantityMode,
  );

  return {
    sizeColumns,
    rows,
    footerBySize,
    grandTotal,
    modeTotals,
  };
}
