import {
  createTable,
  getCoreRowModel,
  getExpandedRowModel,
  getGroupedRowModel,
  getSortedRowModel,
  type ColumnDef,
  type GroupingState,
  type Row,
  type SortingState,
  type Table,
} from '@tanstack/react-table';

import { farmerReportSortingFns } from '@/features/people-report/components/columns';
import { FARMER_REPORT_DEFAULT_SORTING } from '@/features/people-report/components/data-table';
import type {
  FarmerReportSectionMode,
  FarmerReportTableRow,
} from '@/features/people-report/utils/build-farmer-report-sections';
import {
  applyRunningTotalsInDisplayOrder,
  getFarmerReportRowKey,
  getFarmerReportSectionStartingBalance,
} from '@/features/people-report/utils/build-farmer-report-sections';
import { collectExportRows } from '@/features/people-report/utils/export-cell-value';
import { getOrderedRowsForRunningTotals } from '@/features/people-report/utils/report-display-order';
import {
  mapFarmerReportRowToPdfLedger,
  type PdfLedgerGroupRow,
  type PdfLedgerItem,
  type PdfLedgerLeafRow,
} from '@/features/people-report/utils/build-farmer-stock-ledger-pdf-data';
import type { FarmerReportGroupColumnId } from '@/features/people-report/utils/report-grouping';

function isGroupColumnId(columnId: string | undefined): columnId is FarmerReportGroupColumnId {
  return columnId === 'variety' || columnId === 'stockFilter';
}

function getSuppressedGroupColumns(
  grouping: GroupingState,
  depth: number,
): FarmerReportGroupColumnId[] {
  return grouping
    .slice(0, depth)
    .filter((columnId): columnId is FarmerReportGroupColumnId => isGroupColumnId(columnId));
}

function mapTableRowToPdfItem(
  row: Row<FarmerReportTableRow>,
  sizeColumns: string[],
  grouping: GroupingState,
  runningTotalByRowKey: Map<string, number>,
): PdfLedgerItem | null {
  if (row.getIsGrouped()) {
    const columnId = row.groupingColumnId;
    if (!isGroupColumnId(columnId)) return null;

    const label = String(row.getValue(columnId) ?? '—');
    const sizes = Object.fromEntries(
      sizeColumns.map((size) => {
        const value = Number(row.getValue(`size-${size}`));
        return [size, Number.isFinite(value) && value > 0 ? value : 0];
      }),
    ) as Record<string, number>;
    const rowBagsTotal = Number(row.getValue('rowBags'));

    const groupRow: PdfLedgerGroupRow = {
      kind: 'group',
      columnId,
      label,
      depth: row.depth,
      childCount: row.subRows.length,
      sizes,
      rowBagsTotal: Number.isFinite(rowBagsTotal) ? rowBagsTotal : 0,
    };

    return groupRow;
  }

  const leafRow: PdfLedgerLeafRow = {
    ...mapFarmerReportRowToPdfLedger(
      row.original,
      sizeColumns,
      runningTotalByRowKey.get(getFarmerReportRowKey(row.original)),
    ),
    kind: 'leaf',
    depth: row.depth,
    suppressedGroupColumns: getSuppressedGroupColumns(grouping, row.depth),
  };

  return leafRow;
}

function flattenTableRows(
  rows: Row<FarmerReportTableRow>[],
  sizeColumns: string[],
  grouping: GroupingState,
  runningTotalByRowKey: Map<string, number>,
): PdfLedgerItem[] {
  return rows
    .map((row) => mapTableRowToPdfItem(row, sizeColumns, grouping, runningTotalByRowKey))
    .filter((item): item is PdfLedgerItem => item !== null);
}

export type BuildPdfGroupedLedgerItemsInput = {
  rows: FarmerReportTableRow[];
  columns: ColumnDef<FarmerReportTableRow>[];
  grouping: GroupingState;
  sorting?: SortingState;
  sizeColumns: string[];
  sectionMode: FarmerReportSectionMode;
};

export type BuildPdfGroupedLedgerItemsResult = {
  openingBalanceRows: PdfLedgerLeafRow[];
  items: PdfLedgerItem[];
};

function createFarmerReportPdfTable(
  data: FarmerReportTableRow[],
  columns: ColumnDef<FarmerReportTableRow>[],
  grouping: GroupingState,
  sorting: SortingState,
) {
  return createTable({
    data,
    columns,
    state: {
      sorting,
      grouping,
      expanded: true,
    },
    onStateChange: () => undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    sortingFns: farmerReportSortingFns,
    enableSortingRemoval: true,
    sortDescFirst: false,
    groupedColumnMode: 'reorder',
    renderFallbackValue: null,
  });
}

export function buildPdfGroupedLedgerItems({
  rows,
  columns,
  grouping,
  sorting = FARMER_REPORT_DEFAULT_SORTING,
  sizeColumns,
  sectionMode,
}: BuildPdfGroupedLedgerItemsInput): BuildPdfGroupedLedgerItemsResult {
  const isGroupingActive = grouping.length > 0;

  const openingBalanceSourceRows = rows.filter((row) => row.kind === 'opening-balance');

  const groupableData = isGroupingActive
    ? rows.filter((row) => row.kind !== 'opening-balance')
    : rows;

  const table = createFarmerReportPdfTable(groupableData, columns, grouping, sorting);

  const runningTotalByRowKey = applyRunningTotalsInDisplayOrder(
    getOrderedRowsForRunningTotals(
      openingBalanceSourceRows,
      table.getRowModel().rows,
      isGroupingActive,
    ),
    sectionMode,
    getFarmerReportSectionStartingBalance(rows, sectionMode),
  );

  const openingBalanceRows: PdfLedgerLeafRow[] = isGroupingActive
    ? openingBalanceSourceRows.map((row) => ({
        ...mapFarmerReportRowToPdfLedger(
          row,
          sizeColumns,
          runningTotalByRowKey.get(getFarmerReportRowKey(row)),
        ),
        kind: 'leaf' as const,
        depth: 0,
        suppressedGroupColumns: [],
      }))
    : [];

  const items = flattenTableRows(
    table.getRowModel().rows,
    sizeColumns,
    grouping,
    runningTotalByRowKey,
  );

  return { openingBalanceRows, items };
}

export function buildPdfGroupedLedgerItemsFromTable(
  table: Table<FarmerReportTableRow>,
  sizeColumns: string[],
  sectionRows: FarmerReportTableRow[],
  sectionMode: FarmerReportSectionMode,
): BuildPdfGroupedLedgerItemsResult {
  const grouping = table.getState().grouping;
  const isGroupingActive = grouping.length > 0;
  const exportRows = collectExportRows(table);

  const openingBalanceSourceRows = sectionRows.filter((row) => row.kind === 'opening-balance');

  const runningTotalByRowKey = applyRunningTotalsInDisplayOrder(
    getOrderedRowsForRunningTotals(openingBalanceSourceRows, exportRows, isGroupingActive),
    sectionMode,
    getFarmerReportSectionStartingBalance(sectionRows, sectionMode),
  );

  const openingBalanceRows: PdfLedgerLeafRow[] = isGroupingActive
    ? openingBalanceSourceRows.map((row) => ({
        ...mapFarmerReportRowToPdfLedger(
          row,
          sizeColumns,
          runningTotalByRowKey.get(getFarmerReportRowKey(row)),
        ),
        kind: 'leaf' as const,
        depth: 0,
        suppressedGroupColumns: [],
      }))
    : [];

  const items = flattenTableRows(exportRows, sizeColumns, grouping, runningTotalByRowKey);

  return { openingBalanceRows, items };
}
