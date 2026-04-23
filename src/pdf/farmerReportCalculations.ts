import type { DaybookEntry } from '@/services/store-admin/functions/useGetDaybook';
import { shouldShowSpecialFields } from '@/lib/special-fields';

export type SizeQtyLocList = Record<string, { qty: number; loc: string }[]>;

export interface ReceiptRow {
  date: string;
  voucher: string;
  variety: string;
  customMarka: string;
  sizeQtys: SizeQtyLocList;
  rowTotal: number;
  runningTotal: number;
  remarks: string;
}

export interface DeliveryRow {
  date: string;
  voucher: string;
  variety: string;
  customMarka: string;
  sizeQtys: SizeQtyLocList;
  rowTotal: number;
  runningTotal: number;
}

export interface ReceiptVarietySection {
  varietyName: string;
  rows: ReceiptRow[];
  totalsBySize: Record<string, number>;
  varietyTotal: number;
  runningTotalAfter: number;
}

export interface DeliveryVarietySection {
  varietyName: string;
  rows: DeliveryRow[];
  totalsBySize: Record<string, number>;
  varietyDelivered: number;
  runningTotalBefore: number;
  runningTotalAfter: number;
}

function locDisplay(loc: { chamber?: string; floor?: string; row?: string }): string {
  const c = loc?.chamber ?? '';
  const f = loc?.floor ?? '';
  const r = loc?.row ?? '';
  const s = [c, f, r].filter(Boolean).join('-').trim();
  return s ? `(${s})` : '';
}

function formatPdfDate(iso: string): string {
  if (!iso) return '-';
  const d = new Date(iso);
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = String(d.getFullYear()).slice(2);
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
}

export function orderSizeColumnsByPreference(
  sizeColumns: string[],
  preferenceOrder: string[] | undefined
): string[] {
  const unique = [...new Set(sizeColumns)];
  if (!preferenceOrder?.length) return unique;
  const idx = new Map(preferenceOrder.map((s, i) => [s, i]));
  const pref = new Set(preferenceOrder);
  const inPref = unique.filter((c) => pref.has(c));
  const extra = unique.filter((c) => !pref.has(c));
  inPref.sort((a, b) => idx.get(a)! - idx.get(b)!);
  return [...inPref, ...extra];
}

function compareDaybookByGatePassAsc(a: DaybookEntry, b: DaybookEntry): number {
  const ga = a.gatePassNo ?? 0;
  const gb = b.gatePassNo ?? 0;
  if (ga !== gb) return ga - gb;
  return new Date(a.date).getTime() - new Date(b.date).getTime();
}

export function buildReceiptRows(
  incoming: DaybookEntry[],
  sizeColumns: string[],
  startingRunningTotal = 0
): ReceiptRow[] {
  const rows: ReceiptRow[] = [];
  let runningTotal = startingRunningTotal;
  const sorted = [...incoming].sort(compareDaybookByGatePassAsc);

  for (const entry of sorted) {
    if (entry.type !== 'RECEIPT' || !entry.bagSizes?.length) continue;
    const sizeQtys: SizeQtyLocList = Object.fromEntries(sizeColumns.map((col) => [col, []]));
    let rowTotal = 0;
    for (const bag of entry.bagSizes) {
      const size = bag.name;
      const qty = bag.initialQuantity ?? 0;
      const loc = locDisplay(bag.location ?? {});
      if (!sizeQtys[size]) sizeQtys[size] = [];
      sizeQtys[size].push({ qty, loc });
      rowTotal += qty;
    }
    runningTotal += rowTotal;
    rows.push({
      date: formatPdfDate(entry.date),
      voucher: String(entry.gatePassNo ?? ''),
      variety: entry.variety ?? '-',
      customMarka: entry.customMarka ?? '-',
      sizeQtys,
      rowTotal,
      runningTotal,
      remarks: entry.remarks ?? '-',
    });
  }

  return rows;
}

export function buildIncomingTransferRows(
  entries: DaybookEntry[],
  sizeColumns: string[],
  startingRunningTotal = 0
): ReceiptRow[] {
  const rows: ReceiptRow[] = [];
  let runningTotal = startingRunningTotal;
  const sorted = [...entries].sort(compareDaybookByGatePassAsc);

  for (const entry of sorted) {
    if (entry.type !== 'Incoming-transfer' || !entry.bagSizes?.length) continue;
    const sizeQtys: SizeQtyLocList = Object.fromEntries(sizeColumns.map((col) => [col, []]));
    let rowTotal = 0;
    for (const bag of entry.bagSizes) {
      const size = bag.name;
      const qty = bag.initialQuantity ?? 0;
      const loc = locDisplay(bag.location ?? {});
      if (!sizeQtys[size]) sizeQtys[size] = [];
      sizeQtys[size].push({ qty, loc });
      rowTotal += qty;
    }
    runningTotal += rowTotal;
    rows.push({
      date: formatPdfDate(entry.date),
      voucher: String(entry.gatePassNo ?? ''),
      variety: entry.variety ?? '-',
      customMarka: entry.customMarka ?? '-',
      sizeQtys,
      rowTotal,
      runningTotal,
      remarks: entry.remarks ?? '-',
    });
  }

  return rows;
}

export function getOutgoingEntryVariety(entry: DaybookEntry): string {
  const incomingEntries = entry.incomingGatePassEntries ?? [];
  if (incomingEntries.length > 0) {
    const varieties = [...new Set(incomingEntries.map((e) => e.variety?.trim()).filter(Boolean))];
    return varieties.length > 0 ? varieties.join(', ') : '-';
  }
  const snapshots = entry.incomingGatePassSnapshots ?? [];
  if (snapshots.length > 0) {
    const varieties = [...new Set(snapshots.map((s) => s.variety?.trim()).filter(Boolean))];
    return varieties.length > 0 ? varieties.join(', ') : '-';
  }
  return entry.variety?.trim() ?? '-';
}

export function buildDeliveryRows(
  outgoing: DaybookEntry[],
  sizeColumns: string[],
  openingTotal: number
): DeliveryRow[] {
  const rows: DeliveryRow[] = [];
  let runningTotal = openingTotal;
  const sorted = [...outgoing].sort(compareDaybookByGatePassAsc);

  for (const entry of sorted) {
    if (entry.type !== 'DELIVERY') continue;
    const sizeQtys: SizeQtyLocList = Object.fromEntries(sizeColumns.map((col) => [col, []]));
    let rowTotal = 0;
    for (const od of entry.orderDetails ?? []) {
      const size = od.size;
      const qty = od.quantityIssued ?? 0;
      const loc = locDisplay(od.location ?? {});
      if (!sizeQtys[size]) sizeQtys[size] = [];
      sizeQtys[size].push({ qty, loc });
      rowTotal += qty;
    }
    runningTotal -= rowTotal;
    rows.push({
      date: formatPdfDate(entry.date),
      voucher: String(entry.gatePassNo ?? ''),
      variety: getOutgoingEntryVariety(entry),
      customMarka: entry.customMarka ?? '-',
      sizeQtys,
      rowTotal,
      runningTotal,
    });
  }

  return rows;
}

export function totalBagsOutgoing(entry: DaybookEntry): number {
  return (entry.orderDetails ?? []).reduce((s, d) => s + (d.quantityIssued ?? 0), 0);
}

export function groupIncomingByVariety(entries: DaybookEntry[]): Record<string, DaybookEntry[]> {
  return Object.groupBy(entries, (entry) => String(entry.variety ?? '-')) as Record<string, DaybookEntry[]>;
}

export function groupOutgoingByVariety(entries: DaybookEntry[]): Record<string, DaybookEntry[]> {
  return Object.groupBy(entries, getOutgoingEntryVariety) as Record<string, DaybookEntry[]>;
}

function totalsBySize(rows: ReceiptRow[], orderedSizeColumns: string[]): Record<string, number> {
  const totals = Object.fromEntries(orderedSizeColumns.map((col) => [col, 0])) as Record<string, number>;
  for (const row of rows) {
    for (const col of orderedSizeColumns) {
      totals[col] += (row.sizeQtys[col] ?? []).reduce((sum, x) => sum + x.qty, 0);
    }
  }
  return totals;
}

function deliveryTotalsBySize(
  rows: DeliveryRow[],
  orderedSizeColumns: string[]
): Record<string, number> {
  const totals = Object.fromEntries(orderedSizeColumns.map((col) => [col, 0])) as Record<string, number>;
  for (const row of rows) {
    for (const col of orderedSizeColumns) {
      totals[col] += (row.sizeQtys[col] ?? []).reduce((sum, x) => sum + x.qty, 0);
    }
  }
  return totals;
}

export interface FarmerReportComputedData {
  orderedSizeColumns: string[];
  showSpecialFields: boolean;
  useOwnershipFilter: boolean;
  showOwnedSection: boolean;
  showFarmerSection: boolean;
  ownedIncoming: DaybookEntry[];
  farmerIncoming: DaybookEntry[];
  ownedReceiptRows: ReceiptRow[];
  farmerReceiptRows: ReceiptRow[];
  farmIncomingOnly: DaybookEntry[];
  incomingTransferEntries: DaybookEntry[];
  receiptRows: ReceiptRow[];
  totalFarmReceived: number;
  farmReceiptTotalsBySize: Record<string, number>;
  incomingTransferRows: ReceiptRow[];
  totalIncomingTransferBags: number;
  incomingTransferTotalsBySize: Record<string, number>;
  receiptTotalsBySize: Record<string, number>;
  totalReceived: number;
  openingTotal: number;
  deliveryRows: DeliveryRow[];
  hasNonZeroDeliveryVoucher: boolean;
  totalDelivered: number;
  closingBalance: number;
  farmReceiptTxCount: number;
  incomingTransferTxCount: number;
  totalOwned: number;
  totalFarmer: number;
  ownedTransferRows: ReceiptRow[];
  farmerTransferRows: ReceiptRow[];
  ownedTotalsBySize: Record<string, number>;
  farmerTotalsBySize: Record<string, number>;
  ownedTransferTotalsBySize: Record<string, number>;
  totalOwnedTransferBags: number;
  farmerTransferTotalsBySize: Record<string, number>;
  totalFarmerTransferBags: number;
  receiptIncomingByVariety: Record<string, DaybookEntry[]> | null;
  transferIncomingByVariety: Record<string, DaybookEntry[]> | null;
  outgoingByVariety: Record<string, DaybookEntry[]> | null;
  varietyKeys: string[];
  receiptTableCols: string[];
  deliveryTableCols: string[];
  receiptVarietySections: ReceiptVarietySection[];
  transferVarietySections: ReceiptVarietySection[];
  deliveryVarietySections: DeliveryVarietySection[];
}

interface BuildFarmerReportDataInput {
  storeAdminMobileNumber?: string;
  incoming: DaybookEntry[];
  outgoing: DaybookEntry[];
  sizeColumns: string[];
  preferenceSizeOrder?: string[];
  groupByVariety: boolean;
  filterByOwnership: boolean;
  ownershipReportView: 'ALL' | 'OWNED' | 'FARMER';
}

export function buildFarmerReportData({
  storeAdminMobileNumber,
  incoming,
  outgoing,
  sizeColumns,
  preferenceSizeOrder,
  groupByVariety,
  filterByOwnership,
  ownershipReportView,
}: BuildFarmerReportDataInput): FarmerReportComputedData {
  const orderedSizeColumns = orderSizeColumnsByPreference(sizeColumns, preferenceSizeOrder);
  const showSpecialFields = shouldShowSpecialFields(storeAdminMobileNumber);
  const useOwnershipFilter = showSpecialFields && filterByOwnership;

  const ownedIncoming = useOwnershipFilter ? incoming.filter((e) => e.stockFilter === 'OWNED') : [];
  const farmerIncoming = useOwnershipFilter ? incoming.filter((e) => e.stockFilter !== 'OWNED') : [];
  const showOwnedSection = useOwnershipFilter && ownershipReportView !== 'FARMER';
  const showFarmerSection = useOwnershipFilter && ownershipReportView !== 'OWNED';

  const ownedReceiptRows = useOwnershipFilter ? buildReceiptRows(ownedIncoming, orderedSizeColumns) : [];
  const farmerReceiptRows = useOwnershipFilter ? buildReceiptRows(farmerIncoming, orderedSizeColumns) : [];

  const farmIncomingOnly = incoming.filter((e) => e.type === 'RECEIPT');
  const incomingTransferEntries = incoming.filter((e) => e.type === 'Incoming-transfer');

  const receiptRows = buildReceiptRows(farmIncomingOnly, orderedSizeColumns);
  const totalFarmReceived = receiptRows.reduce((s, r) => s + r.rowTotal, 0);
  const farmReceiptTotalsBySize = totalsBySize(receiptRows, orderedSizeColumns);

  const incomingTransferRows = buildIncomingTransferRows(
    incomingTransferEntries,
    orderedSizeColumns,
    totalFarmReceived
  );
  const totalIncomingTransferBags = incomingTransferRows.reduce((s, r) => s + r.rowTotal, 0);
  const incomingTransferTotalsBySize = totalsBySize(incomingTransferRows, orderedSizeColumns);

  const receiptTotalsBySize = Object.fromEntries(
    orderedSizeColumns.map((col) => [col, (farmReceiptTotalsBySize[col] ?? 0) + (incomingTransferTotalsBySize[col] ?? 0)])
  ) as Record<string, number>;

  const totalReceived = totalFarmReceived + totalIncomingTransferBags;
  const openingTotal = totalReceived;
  const deliveryRows = buildDeliveryRows(outgoing, orderedSizeColumns, openingTotal);
  const hasNonZeroDeliveryVoucher = deliveryRows.some((row) => Number(row.voucher) > 0);
  const totalDelivered = outgoing.reduce((s, e) => s + totalBagsOutgoing(e), 0);
  const closingBalance = openingTotal - totalDelivered;

  const farmReceiptTxCount = farmIncomingOnly.length;
  const incomingTransferTxCount = incomingTransferEntries.length;

  const totalOwned = ownedReceiptRows.reduce((s, r) => s + r.rowTotal, 0);
  const totalFarmer = farmerReceiptRows.reduce((s, r) => s + r.rowTotal, 0);

  const ownedTransferRows = useOwnershipFilter
    ? buildIncomingTransferRows(
        ownedIncoming.filter((e) => e.type === 'Incoming-transfer'),
        orderedSizeColumns,
        totalOwned
      )
    : [];
  const farmerTransferRows = useOwnershipFilter
    ? buildIncomingTransferRows(
        farmerIncoming.filter((e) => e.type === 'Incoming-transfer'),
        orderedSizeColumns,
        totalFarmer
      )
    : [];

  const ownedTotalsBySize = useOwnershipFilter ? totalsBySize(ownedReceiptRows, orderedSizeColumns) : {};
  const farmerTotalsBySize = useOwnershipFilter ? totalsBySize(farmerReceiptRows, orderedSizeColumns) : {};
  const ownedTransferTotalsBySize = useOwnershipFilter ? totalsBySize(ownedTransferRows, orderedSizeColumns) : {};
  const totalOwnedTransferBags = ownedTransferRows.reduce((s, r) => s + r.rowTotal, 0);
  const farmerTransferTotalsBySize = useOwnershipFilter ? totalsBySize(farmerTransferRows, orderedSizeColumns) : {};
  const totalFarmerTransferBags = farmerTransferRows.reduce((s, r) => s + r.rowTotal, 0);

  const receiptIncomingByVariety = groupByVariety ? groupIncomingByVariety(farmIncomingOnly) : null;
  const transferIncomingByVariety = groupByVariety ? groupIncomingByVariety(incomingTransferEntries) : null;
  const outgoingByVariety = groupByVariety ? groupOutgoingByVariety(outgoing) : null;
  const varietyKeys = groupByVariety
    ? [
        ...new Set([
          ...Object.keys(receiptIncomingByVariety ?? {}),
          ...Object.keys(outgoingByVariety ?? {}),
          ...Object.keys(transferIncomingByVariety ?? {}),
        ]),
      ].sort()
    : [];

  const receiptTableCols = showSpecialFields
    ? ['DATE', 'VOUCHER', 'VARIETY', 'CUSTOM MARKA', ...orderedSizeColumns, 'TOTAL', 'REMARKS']
    : ['DATE', 'VOUCHER', 'VARIETY', ...orderedSizeColumns, 'TOTAL', 'G.TOTAL', 'REMARKS'];
  const deliveryTableCols = showSpecialFields
    ? ['DATE', 'VOUCHER', 'VARIETY', 'CUSTOM MARKA', ...orderedSizeColumns, 'TOTAL']
    : ['DATE', 'VOUCHER', 'VARIETY', ...orderedSizeColumns, 'TOTAL', 'G.TOTAL'];

  const receiptVarietySections: ReceiptVarietySection[] = [];
  if (groupByVariety) {
    let runningTotal = 0;
    for (const varietyName of varietyKeys) {
      const varietyIncoming = receiptIncomingByVariety?.[varietyName] ?? [];
      if (varietyIncoming.length === 0) continue;
      const rows = buildReceiptRows(varietyIncoming, orderedSizeColumns, runningTotal);
      const varietyTotal = rows.reduce((sum, row) => sum + row.rowTotal, 0);
      runningTotal += varietyTotal;
      receiptVarietySections.push({
        varietyName,
        rows,
        totalsBySize: totalsBySize(rows, orderedSizeColumns),
        varietyTotal,
        runningTotalAfter: runningTotal,
      });
    }
  }

  const transferVarietySections: ReceiptVarietySection[] = [];
  if (groupByVariety) {
    let runningTotal = totalFarmReceived;
    for (const varietyName of varietyKeys) {
      const varietyTransfer = transferIncomingByVariety?.[varietyName] ?? [];
      if (varietyTransfer.length === 0) continue;
      const rows = buildIncomingTransferRows(varietyTransfer, orderedSizeColumns, runningTotal);
      const varietyTotal = rows.reduce((sum, row) => sum + row.rowTotal, 0);
      runningTotal += varietyTotal;
      transferVarietySections.push({
        varietyName,
        rows,
        totalsBySize: totalsBySize(rows, orderedSizeColumns),
        varietyTotal,
        runningTotalAfter: runningTotal,
      });
    }
  }

  const deliveryVarietySections: DeliveryVarietySection[] = [];
  if (groupByVariety) {
    let runningTotalBefore = openingTotal;
    for (const varietyName of varietyKeys) {
      const varietyOutgoing = outgoingByVariety?.[varietyName] ?? [];
      if (varietyOutgoing.length === 0) continue;
      const rows = buildDeliveryRows(varietyOutgoing, orderedSizeColumns, runningTotalBefore);
      const varietyDelivered = rows.reduce((sum, row) => sum + row.rowTotal, 0);
      const runningTotalAfter = runningTotalBefore - varietyDelivered;
      deliveryVarietySections.push({
        varietyName,
        rows,
        totalsBySize: deliveryTotalsBySize(rows, orderedSizeColumns),
        varietyDelivered,
        runningTotalBefore,
        runningTotalAfter,
      });
      runningTotalBefore = runningTotalAfter;
    }
  }

  return {
    orderedSizeColumns,
    showSpecialFields,
    useOwnershipFilter,
    showOwnedSection,
    showFarmerSection,
    ownedIncoming,
    farmerIncoming,
    ownedReceiptRows,
    farmerReceiptRows,
    farmIncomingOnly,
    incomingTransferEntries,
    receiptRows,
    totalFarmReceived,
    farmReceiptTotalsBySize,
    incomingTransferRows,
    totalIncomingTransferBags,
    incomingTransferTotalsBySize,
    receiptTotalsBySize,
    totalReceived,
    openingTotal,
    deliveryRows,
    hasNonZeroDeliveryVoucher,
    totalDelivered,
    closingBalance,
    farmReceiptTxCount,
    incomingTransferTxCount,
    totalOwned,
    totalFarmer,
    ownedTransferRows,
    farmerTransferRows,
    ownedTotalsBySize,
    farmerTotalsBySize,
    ownedTransferTotalsBySize,
    totalOwnedTransferBags,
    farmerTransferTotalsBySize,
    totalFarmerTransferBags,
    receiptIncomingByVariety,
    transferIncomingByVariety,
    outgoingByVariety,
    varietyKeys,
    receiptTableCols,
    deliveryTableCols,
    receiptVarietySections,
    transferVarietySections,
    deliveryVarietySections,
  };
}
