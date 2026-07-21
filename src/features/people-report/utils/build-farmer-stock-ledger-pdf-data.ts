import type { GroupingState, SortingState, Table } from '@tanstack/react-table';

import type { CommodityPreference } from '@/features/auth/types';
import type { DaybookEntry, OutgoingDaybookEntry } from '@/features/daybook/types';
import { isIncomingDaybookEntry, isOutgoingDaybookEntry } from '@/features/daybook/types';
import {
  formatDaybookDate,
  formatManualParchi,
  formatQuantity,
  formatSizeQuantityLocationSubtext,
} from '@/features/daybook/utils/format';
import type { FarmerGatePassSummaries } from '@/features/people/api/use-farmer-gate-passes';
import type { PersonDetailSearch } from '@/features/people/search';
import { personDetailSearchToFarmerDisplay } from '@/features/people/utils/person-detail-search';
import {
  buildFarmerStockSummary,
  type StockSummaryMatrix,
} from '@/features/people/utils/build-farmer-stock-summary';
import {
  getFarmerReportRowBagTotal,
  sumFarmerReportRowSizeColumn,
  type FarmerReportSections,
  type FarmerReportTableRow,
} from '@/features/people-report/utils/build-farmer-report-sections';
import {
  buildPdfGroupedLedgerItems,
  buildPdfGroupedLedgerItemsFromTable,
} from '@/features/people-report/utils/build-farmer-report-pdf-grouped-ledger';
import type { LedgerExportColumn } from '@/features/people-report/utils/export-cell-value';
import { getFarmerReportColumnsForSizes } from '@/features/people-report/components/columns';
import { FARMER_REPORT_DEFAULT_SORTING } from '@/features/people-report/components/data-table';
import {
  collectUniqueBagSizes,
  getGatePassTotalBags,
  getGatePassSizeQuantityLines,
  getGatePassStockFilter,
  getGatePassVariety,
  getOutgoingSizeQuantityDetailLines,
  getOutgoingSizeQuantityLinesForVariety,
  getOutgoingVarietyBreakdown,
  hasMultipleOutgoingVarieties,
  orderBagSizes,
} from '@/features/people-report/utils/gate-pass-table-helpers';

export type PdfLedgerSizeValue =
  { type: 'stacked'; main: string; sub: string } | { type: 'plain'; value: string };

export type PdfLedgerVarietyValue =
  | {
      type: 'breakdown';
      lines: Array<{ variety: string; quantity: string }>;
    }
  | { type: 'plain'; value: string };

export function formatPdfVarietyValue(value: PdfLedgerVarietyValue): string {
  if (value.type === 'plain') return value.value;

  return value.lines.map((line) => `${line.variety} (${line.quantity})`).join('\n');
}

export type PdfLedgerRow = {
  date: string;
  gatePass: string;
  manualParchi: string;
  variety: PdfLedgerVarietyValue;
  stockFilter: string;
  customMarka: string;
  sizes: Record<string, PdfLedgerSizeValue | null>;
  rowBags: string;
  total: string;
  remarks: string;
  isOpeningBalance?: boolean;
};

export type PdfLedgerGroupRow = {
  kind: 'group';
  columnId: 'variety' | 'stockFilter';
  label: string;
  depth: number;
  childCount: number;
  sizes: Record<string, number>;
  rowBagsTotal: number;
};

export type PdfLedgerLeafRow = PdfLedgerRow & {
  kind: 'leaf';
  depth: number;
  suppressedGroupColumns: ('variety' | 'stockFilter')[];
};

export type PdfLedgerItem = PdfLedgerGroupRow | PdfLedgerLeafRow;

export type FarmerStockLedgerPdfData = {
  farmer: {
    name: string;
    address: string;
    mobileNumber: string;
    accountNumber?: number;
  };
  stats: {
    incomingGatePassCount: number;
    incomingBags: number;
    incomingInternalBags: number;
    outgoingGatePassCount: number;
    outgoingBags: number;
    outgoingInternalBags: number;
  };
  showStockFilter: boolean;
  showCustomMarka: boolean;
  stockSummary: StockSummaryMatrix;
  sizeColumns: string[];
  incomingLedger: PdfLedgerItem[];
  outgoingLedger: PdfLedgerItem[];
  incomingFooterSizes: Record<string, number>;
  outgoingFooterSizes: Record<string, number>;
  incomingClosingBalance: number;
  outgoingClosingBalance: number;
  generatedAt: string;
  exportColumns: LedgerExportColumn[];
};

function computeIncomingFooterSizes(
  rows: FarmerReportTableRow[],
  sizeColumns: string[],
): Record<string, number> {
  const gatePassRows = rows.filter((row) => row.kind === 'gate-pass' && row.entry);

  return Object.fromEntries(
    sizeColumns.map((size) => [size, sumFarmerReportRowSizeColumn(gatePassRows, size)]),
  );
}

function computeOutgoingFooterSizes(
  rows: FarmerReportTableRow[],
  sizeColumns: string[],
): Record<string, number> {
  const openingRow = rows.find((row) => row.kind === 'opening-balance');
  const gatePassRows = rows.filter((row) => row.kind === 'gate-pass' && row.entry);

  return Object.fromEntries(
    sizeColumns.map((size) => {
      const openingTotal = openingRow?.sizeTotals?.[size] ?? 0;
      const outgoingTotal = sumFarmerReportRowSizeColumn(gatePassRows, size);

      return [size, openingTotal - outgoingTotal];
    }),
  );
}

export type BuildFarmerStockLedgerPdfDataInput = {
  entries: DaybookEntry[];
  sections: FarmerReportSections;
  summaries: FarmerGatePassSummaries;
  commodities: CommodityPreference[];
  search: PersonDetailSearch;
  showStockFilter?: boolean;
  showCustomMarka?: boolean;
  grouping?: GroupingState;
  sorting?: SortingState;
  incomingSorting?: SortingState;
  outgoingSorting?: SortingState;
  visibleColumnIds?: string[];
  exportColumns?: LedgerExportColumn[];
  incomingTable?: Table<FarmerReportTableRow> | null;
  outgoingTable?: Table<FarmerReportTableRow> | null;
  generatedAt?: Date;
};

function formatGeneratedAt(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function mapOutgoingSizeValueForEntry(
  entry: OutgoingDaybookEntry,
  size: string,
  varietySlice?: string,
): PdfLedgerSizeValue | null {
  if (varietySlice) {
    const lines = getOutgoingSizeQuantityLinesForVariety(entry, size, varietySlice);
    if (lines.length === 0) return null;

    if (lines.length === 1) {
      const line = lines[0]!;
      const subtext = formatSizeQuantityLocationSubtext(line);
      if (subtext) {
        return {
          type: 'stacked',
          main: formatQuantity(line.quantity),
          sub: subtext,
        };
      }

      return { type: 'plain', value: formatQuantity(line.quantity) };
    }

    const total = lines.reduce((sum, line) => sum + line.quantity, 0);
    const locations = lines
      .map((line) => {
        const subtext = formatSizeQuantityLocationSubtext(line);
        return subtext
          ? `${formatQuantity(line.quantity)} ${subtext.replaceAll('\n', ', ')}`
          : `${formatQuantity(line.quantity)}`;
      })
      .join(', ');

    return {
      type: 'stacked',
      main: formatQuantity(total),
      sub: `(${locations})`,
    };
  }

  if (!hasMultipleOutgoingVarieties(entry)) {
    return null;
  }

  const detailLines = getOutgoingSizeQuantityDetailLines(entry, size);
  if (detailLines.length === 0) return null;

  if (detailLines.length === 1) {
    const line = detailLines[0]!;
    return {
      type: 'stacked',
      main: formatQuantity(line.quantity),
      sub: `(${line.locationLabel}, ${line.variety})`,
    };
  }

  const total = detailLines.reduce((sum, line) => sum + line.quantity, 0);
  const breakdown = detailLines
    .map((line) => `${formatQuantity(line.quantity)} (${line.locationLabel}, ${line.variety})`)
    .join(', ');

  return {
    type: 'stacked',
    main: formatQuantity(total),
    sub: `(${breakdown})`,
  };
}

function mapVarietyForEntry(row: FarmerReportTableRow): PdfLedgerVarietyValue {
  if (row.kind === 'opening-balance' || !row.entry) {
    return { type: 'plain', value: '—' };
  }

  if (row.varietySlice) {
    return { type: 'plain', value: row.varietySlice };
  }

  if (isOutgoingDaybookEntry(row.entry) && hasMultipleOutgoingVarieties(row.entry)) {
    return {
      type: 'breakdown',
      lines: getOutgoingVarietyBreakdown(row.entry).map((line) => ({
        variety: line.variety,
        quantity: formatQuantity(line.quantity),
      })),
    };
  }

  return { type: 'plain', value: getGatePassVariety(row.entry) };
}

function mapSizeValueForEntry(row: FarmerReportTableRow, size: string): PdfLedgerSizeValue | null {
  if (row.kind === 'opening-balance') {
    const total = row.sizeTotals?.[size];
    if (total === undefined || total <= 0) return null;
    return { type: 'plain', value: formatQuantity(total) };
  }

  if (!row.entry) return null;

  if (isOutgoingDaybookEntry(row.entry)) {
    const outgoingSizeValue = mapOutgoingSizeValueForEntry(row.entry, size, row.varietySlice);
    if (outgoingSizeValue) return outgoingSizeValue;
    if (row.varietySlice) return null;
  }

  const lines = getGatePassSizeQuantityLines(row.entry, size);
  if (lines.length === 0) return null;

  if (lines.length === 1) {
    const line = lines[0]!;
    const subtext = formatSizeQuantityLocationSubtext(line);
    if (subtext) {
      return {
        type: 'stacked',
        main: formatQuantity(line.quantity),
        sub: subtext,
      };
    }

    return { type: 'plain', value: formatQuantity(line.quantity) };
  }

  const total = lines.reduce((sum, line) => sum + line.quantity, 0);
  const locations = lines
    .map((line) => {
      const subtext = formatSizeQuantityLocationSubtext(line);
      return subtext
        ? `${formatQuantity(line.quantity)} ${subtext.replaceAll('\n', ', ')}`
        : `${formatQuantity(line.quantity)}`;
    })
    .join(', ');

  return {
    type: 'stacked',
    main: formatQuantity(total),
    sub: `(${locations})`,
  };
}

function getRowStockFilter(row: FarmerReportTableRow): string {
  if (row.kind === 'opening-balance' || !row.entry) return '—';
  return getGatePassStockFilter(row.entry);
}

function getRowCustomMarka(row: FarmerReportTableRow): string {
  if (row.kind === 'opening-balance' || !row.entry) return '—';
  if (!isIncomingDaybookEntry(row.entry)) return '—';
  return row.entry.customMarka?.trim() || '—';
}

function computeExportStats(entries: DaybookEntry[]): FarmerStockLedgerPdfData['stats'] {
  const incoming = entries.filter(isIncomingDaybookEntry);
  const outgoing = entries.filter(
    (entry) => isOutgoingDaybookEntry(entry) && entry.isNull !== true,
  );

  const sumBags = (rows: DaybookEntry[]) =>
    rows.reduce((total, entry) => total + getGatePassTotalBags(entry), 0);

  return {
    incomingGatePassCount: incoming.length,
    incomingBags: sumBags(incoming),
    incomingInternalBags: sumBags(incoming.filter((entry) => entry.type === 'Incoming-transfer')),
    outgoingGatePassCount: outgoing.length,
    outgoingBags: sumBags(outgoing),
    outgoingInternalBags: sumBags(outgoing.filter((entry) => entry.type === 'Outgoing-transfer')),
  };
}

export function mapFarmerReportRowToPdfLedger(
  row: FarmerReportTableRow,
  sizeColumns: string[],
  runningTotalOverride?: number,
): PdfLedgerRow {
  const runningTotal = runningTotalOverride ?? row.runningTotal;
  const sizes = Object.fromEntries(
    sizeColumns.map((size) => [size, mapSizeValueForEntry(row, size)]),
  ) as Record<string, PdfLedgerSizeValue | null>;

  if (row.kind === 'opening-balance') {
    return {
      date: 'Opening Balance',
      gatePass: '—',
      manualParchi: '—',
      variety: { type: 'plain', value: '—' },
      stockFilter: '—',
      customMarka: '—',
      sizes,
      rowBags: formatQuantity(getFarmerReportRowBagTotal(row)),
      total: formatQuantity(runningTotal),
      remarks: '—',
      isOpeningBalance: true,
    };
  }

  const entry = row.entry!;
  return {
    date: formatDaybookDate(entry.date || entry.createdAt),
    gatePass: `#${entry.gatePassNo}`,
    manualParchi: formatManualParchi(entry.manualParchiNumber),
    variety: mapVarietyForEntry(row),
    stockFilter: getRowStockFilter(row),
    customMarka: getRowCustomMarka(row),
    sizes,
    rowBags: formatQuantity(getFarmerReportRowBagTotal(row)),
    total: formatQuantity(runningTotal),
    remarks: entry.remarks?.trim() || '—',
  };
}

export function buildFarmerStockLedgerPdfData({
  entries,
  sections,
  summaries: _summaries,
  commodities,
  search,
  showStockFilter = false,
  showCustomMarka = false,
  grouping = [],
  sorting = FARMER_REPORT_DEFAULT_SORTING,
  incomingSorting,
  outgoingSorting,
  visibleColumnIds,
  exportColumns = [],
  incomingTable,
  outgoingTable,
  generatedAt = new Date(),
}: BuildFarmerStockLedgerPdfDataInput): FarmerStockLedgerPdfData {
  const incomingPasses = entries.filter(isIncomingDaybookEntry);
  const stockSummary = buildFarmerStockSummary({
    passes: incomingPasses,
    commodities,
    stockFilterTab: 'all',
    quantityMode: 'current',
  });

  const allSizeColumns = orderBagSizes(collectUniqueBagSizes(entries), commodities);

  const exportShowStockFilter =
    showStockFilter && (!visibleColumnIds || visibleColumnIds.includes('stockFilter'));
  const exportShowCustomMarka =
    showCustomMarka && (!visibleColumnIds || visibleColumnIds.includes('customMarka'));
  const sizeColumns = visibleColumnIds
    ? allSizeColumns.filter((size) => visibleColumnIds.includes(`size-${size}`))
    : allSizeColumns;

  const columns = getFarmerReportColumnsForSizes(
    sizeColumns,
    exportShowCustomMarka,
    exportShowStockFilter,
  );

  const resolvedIncomingSorting = incomingSorting ?? sorting;
  const resolvedOutgoingSorting = outgoingSorting ?? sorting;

  const incomingResult = incomingTable
    ? buildPdfGroupedLedgerItemsFromTable(incomingTable, sizeColumns, sections.incoming, 'incoming')
    : buildPdfGroupedLedgerItems({
        rows: sections.incoming,
        columns,
        grouping,
        sorting: resolvedIncomingSorting,
        sizeColumns,
        sectionMode: 'incoming',
      });

  const outgoingResult = outgoingTable
    ? buildPdfGroupedLedgerItemsFromTable(outgoingTable, sizeColumns, sections.outgoing, 'outgoing')
    : buildPdfGroupedLedgerItems({
        rows: sections.outgoing,
        columns,
        grouping,
        sorting: resolvedOutgoingSorting,
        sizeColumns,
        sectionMode: 'outgoing',
      });

  const stats = computeExportStats(entries);

  const incomingClosingBalance =
    sections.incoming.length > 0
      ? sections.incoming[sections.incoming.length - 1]!.runningTotal
      : 0;

  const outgoingClosingBalance =
    sections.outgoing.length > 0
      ? (sections.outgoing.filter((row) => row.kind === 'gate-pass').at(-1)?.runningTotal ??
        sections.outgoing.at(-1)?.runningTotal ??
        0)
      : 0;

  return {
    farmer: personDetailSearchToFarmerDisplay(search),
    stats,
    showStockFilter: exportShowStockFilter,
    showCustomMarka: exportShowCustomMarka,
    stockSummary,
    sizeColumns,
    incomingLedger: incomingResult.items,
    outgoingLedger: [...outgoingResult.openingBalanceRows, ...outgoingResult.items],
    incomingFooterSizes: computeIncomingFooterSizes(sections.incoming, sizeColumns),
    outgoingFooterSizes: computeOutgoingFooterSizes(sections.outgoing, sizeColumns),
    incomingClosingBalance,
    outgoingClosingBalance,
    generatedAt: formatGeneratedAt(generatedAt),
    exportColumns,
  };
}
