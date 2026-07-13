import type { DaybookEntry } from '@/features/daybook/types';
import { isIncomingDaybookEntry, isOutgoingDaybookEntry } from '@/features/daybook/types';

import {
  collectUniqueBagSizes,
  getGatePassSizeQuantity,
  getGatePassTotalBags,
  getOutgoingSizeQuantityForVariety,
  getOutgoingVarietyBreakdown,
  sumSizeColumn,
} from './gate-pass-table-helpers';

export type FarmerReportRowKind = 'gate-pass' | 'opening-balance';

export type FarmerReportTableRow = {
  entry: DaybookEntry | null;
  runningTotal: number;
  rowBags: number;
  kind: FarmerReportRowKind;
  sizeTotals?: Record<string, number>;
  /** Set when an outgoing gate pass is split into one row per variety. */
  varietySlice?: string;
};

export type BuildFarmerReportSectionsOptions = {
  splitOutgoingByVariety?: boolean;
};

export function getFarmerReportRowBagTotal(row: FarmerReportTableRow): number {
  if (row.kind === 'opening-balance') {
    if (!row.sizeTotals) return 0;

    return Object.values(row.sizeTotals).reduce((sum, value) => sum + value, 0);
  }

  return row.rowBags;
}

/** Size quantity for a report row, scoped to varietySlice when present. */
export function getFarmerReportRowSizeQuantity(row: FarmerReportTableRow, size: string): number {
  if (row.kind === 'opening-balance') {
    return row.sizeTotals?.[size] ?? 0;
  }

  if (!row.entry) return 0;

  if (row.varietySlice && isOutgoingDaybookEntry(row.entry)) {
    return getOutgoingSizeQuantityForVariety(row.entry, size, row.varietySlice) ?? 0;
  }

  return getGatePassSizeQuantity(row.entry, size) ?? 0;
}

export function sumFarmerReportRowSizeColumn(rows: FarmerReportTableRow[], size: string): number {
  return rows.reduce((sum, row) => sum + getFarmerReportRowSizeQuantity(row, size), 0);
}

export function getFarmerReportRowKey(row: FarmerReportTableRow): string {
  if (row.kind === 'opening-balance') return 'opening-balance';

  const baseKey = row.entry?._id ?? `gate-pass-${row.entry?.gatePassNo ?? 'unknown'}`;

  if (row.varietySlice) {
    return `${baseKey}:${row.varietySlice}`;
  }

  return baseKey;
}

export function getFarmerReportSectionStartingBalance(
  rows: FarmerReportTableRow[],
  mode: FarmerReportSectionMode,
): number {
  if (mode === 'incoming') return 0;

  const openingRow = rows.find((row) => row.kind === 'opening-balance');
  return openingRow?.runningTotal ?? 0;
}

/** Recompute running totals for the order rows are shown in the table. */
export function applyRunningTotalsInDisplayOrder(
  orderedRows: FarmerReportTableRow[],
  mode: FarmerReportSectionMode,
  startingBalance = getFarmerReportSectionStartingBalance(orderedRows, mode),
): Map<string, number> {
  const totals = new Map<string, number>();
  let runningTotal = startingBalance;

  for (const row of orderedRows) {
    if (row.kind === 'opening-balance') {
      totals.set(getFarmerReportRowKey(row), startingBalance);
      runningTotal = startingBalance;
      continue;
    }

    const rowBags = getFarmerReportRowBagTotal(row);

    if (mode === 'incoming') {
      runningTotal += rowBags;
    } else {
      runningTotal -= rowBags;
    }

    totals.set(getFarmerReportRowKey(row), runningTotal);
  }

  return totals;
}

export type FarmerReportSectionMode = 'incoming' | 'outgoing';

export type FarmerReportSections = {
  incoming: FarmerReportTableRow[];
  outgoing: FarmerReportTableRow[];
  incomingClosingBalance: number;
};

function getEntrySortTimestamp(entry: DaybookEntry): number {
  const timestamp = Date.parse(entry.createdAt || entry.date);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function sortEntriesOldestFirst(entries: DaybookEntry[]): DaybookEntry[] {
  return [...entries].sort((left, right) => {
    const leftTimestamp = getEntrySortTimestamp(left);
    const rightTimestamp = getEntrySortTimestamp(right);

    if (leftTimestamp !== rightTimestamp) {
      return leftTimestamp - rightTimestamp;
    }

    return left.gatePassNo - right.gatePassNo;
  });
}

export function splitFarmerReportEntries(entries: DaybookEntry[]): {
  incoming: DaybookEntry[];
  outgoing: DaybookEntry[];
} {
  const incoming = sortEntriesOldestFirst(entries.filter(isIncomingDaybookEntry));
  const outgoing = sortEntriesOldestFirst(
    entries.filter((entry) => isOutgoingDaybookEntry(entry) && entry.isNull !== true),
  );

  return { incoming, outgoing };
}

export function buildFarmerReportRows(
  entries: DaybookEntry[],
  mode: FarmerReportSectionMode,
  startingBalance = 0,
  options: BuildFarmerReportSectionsOptions = {},
): FarmerReportTableRow[] {
  let runningTotal = startingBalance;
  const rows: FarmerReportTableRow[] = [];

  for (const entry of entries) {
    if (mode === 'outgoing' && options.splitOutgoingByVariety && isOutgoingDaybookEntry(entry)) {
      const breakdown = getOutgoingVarietyBreakdown(entry);

      if (breakdown.length > 1) {
        for (const line of breakdown) {
          runningTotal -= line.quantity;
          rows.push({
            entry,
            runningTotal,
            rowBags: line.quantity,
            kind: 'gate-pass',
            varietySlice: line.variety,
          });
        }
        continue;
      }

      const varietySlice = breakdown.length === 1 ? breakdown[0]!.variety : undefined;
      const rowBags = getGatePassTotalBags(entry);
      runningTotal -= rowBags;
      rows.push({
        entry,
        runningTotal,
        rowBags,
        kind: 'gate-pass',
        ...(varietySlice ? { varietySlice } : {}),
      });
      continue;
    }

    const rowBags = getGatePassTotalBags(entry);

    if (mode === 'incoming') {
      runningTotal += rowBags;
    } else {
      runningTotal -= rowBags;
    }

    rows.push({
      entry,
      runningTotal,
      rowBags,
      kind: 'gate-pass',
    });
  }

  return rows;
}

function buildOpeningBalanceRow(
  incomingEntries: DaybookEntry[],
  closingBalance: number,
): FarmerReportTableRow {
  const sizes = collectUniqueBagSizes(incomingEntries);
  const sizeTotals: Record<string, number> = {};

  for (const size of sizes) {
    const total = sumSizeColumn(incomingEntries, size);
    if (total > 0) {
      sizeTotals[size] = total;
    }
  }

  return {
    entry: null,
    runningTotal: closingBalance,
    rowBags: 0,
    kind: 'opening-balance',
    sizeTotals,
  };
}

export function buildFarmerReportSections(
  entries: DaybookEntry[],
  options: BuildFarmerReportSectionsOptions = {},
): FarmerReportSections {
  const { incoming, outgoing } = splitFarmerReportEntries(entries);
  const incomingRows = buildFarmerReportRows(incoming, 'incoming');
  const incomingClosingBalance =
    incomingRows.length > 0 ? incomingRows[incomingRows.length - 1]!.runningTotal : 0;
  const outgoingGatePassRows = buildFarmerReportRows(
    outgoing,
    'outgoing',
    incomingClosingBalance,
    options,
  );
  const openingBalanceRow =
    incomingRows.length > 0 && outgoingGatePassRows.length > 0
      ? buildOpeningBalanceRow(incoming, incomingClosingBalance)
      : null;
  const outgoingRows = openingBalanceRow
    ? [openingBalanceRow, ...outgoingGatePassRows]
    : outgoingGatePassRows;

  return {
    incoming: incomingRows,
    outgoing: outgoingRows,
    incomingClosingBalance,
  };
}
