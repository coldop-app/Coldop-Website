/* eslint-disable react-refresh/only-export-components */
import { memo, useContext } from 'react';
import type { ColumnDef, Row, SortingFn } from '@tanstack/react-table';

import { RunningTotalsContext } from '@/features/people-report/components/data-table';
import type { CommodityPreference } from '@/features/auth/types';
import type { DaybookEntry } from '@/features/daybook/types';
import { isIncomingDaybookEntry, isOutgoingDaybookEntry } from '@/features/daybook/types';
import {
  formatDaybookDate,
  formatManualParchi,
  formatQuantity,
} from '@/features/daybook/utils/format';
import {
  getFarmerReportRowBagTotal,
  getFarmerReportRowKey,
  type FarmerReportTableRow,
} from '@/features/people-report/utils/build-farmer-report-sections';
import {
  collectUniqueBagSizes,
  getGatePassSizeQuantity,
  getGatePassSizeQuantityLines,
  getGatePassStockFilter,
  getGatePassVariety,
  getOutgoingSizeQuantityDetailLines,
  getOutgoingSizeQuantityForVariety,
  getOutgoingSizeQuantityLinesForVariety,
  getOutgoingVarietyBreakdown,
  hasMultipleOutgoingVarieties,
  orderBagSizes,
} from '@/features/people-report/utils/gate-pass-table-helpers';

const farmerReportNumericSortingFn: SortingFn<FarmerReportTableRow> = (rowA, rowB, columnId) => {
  const a = Number(rowA.getValue(columnId));
  const b = Number(rowB.getValue(columnId));

  if (!Number.isFinite(a) && !Number.isFinite(b)) return 0;
  if (!Number.isFinite(a)) return -1;
  if (!Number.isFinite(b)) return 1;

  return a === b ? 0 : a > b ? 1 : -1;
};

export const farmerReportSortingFns = {
  farmerReportNumeric: farmerReportNumericSortingFn,
};

function getRowDateSortValue(row: FarmerReportTableRow): number | null {
  if (row.kind === 'opening-balance' || !row.entry) return null;

  const timestamp = Date.parse(row.entry.date || row.entry.createdAt);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function getRowManualParchiSortValue(row: FarmerReportTableRow): number | null {
  if (!row.entry) return null;

  const value = row.entry.manualParchiNumber;
  if (value == null || value === '') return null;

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  const parsed = Number(String(value).replaceAll(',', '').trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function getRowSizeSortValue(row: FarmerReportTableRow, size: string): number | null {
  if (row.kind === 'opening-balance') {
    const total = row.sizeTotals?.[size];
    return total !== undefined && total > 0 ? total : null;
  }

  if (!row.entry) return null;

  if (row.varietySlice && isOutgoingDaybookEntry(row.entry)) {
    return getOutgoingSizeQuantityForVariety(row.entry, size, row.varietySlice);
  }

  return getGatePassSizeQuantity(row.entry, size);
}

function RunningTotalCell({ value }: { value: number }) {
  return <span className="text-foreground font-medium tabular-nums">{formatQuantity(value)}</span>;
}

function CumulativeTotalCell({ row }: { row: Row<FarmerReportTableRow> }) {
  const runningTotalByRowKey = useContext(RunningTotalsContext);
  const rowKey = getFarmerReportRowKey(row.original);
  const value = runningTotalByRowKey.get(rowKey) ?? row.original.runningTotal;

  return <RunningTotalCell value={value} />;
}

function SizeQuantityCell({ row, size }: { row: FarmerReportTableRow; size: string }) {
  if (row.kind === 'opening-balance') {
    const total = row.sizeTotals?.[size];
    if (total === undefined || total <= 0) {
      return <span className="text-muted-foreground">—</span>;
    }

    return <span className="tabular-nums">{formatQuantity(total)}</span>;
  }

  if (!row.entry) {
    return <span className="text-muted-foreground">—</span>;
  }

  if (row.varietySlice && isOutgoingDaybookEntry(row.entry)) {
    const lines = getOutgoingSizeQuantityLinesForVariety(row.entry, size, row.varietySlice);

    if (lines.length === 0) {
      return <span className="text-muted-foreground">—</span>;
    }

    return (
      <div className="flex flex-col items-end gap-1">
        {lines.map((line, index) => (
          <div key={`${line.locationLabel}-${index}`} className="flex flex-col items-end gap-0.5">
            <span className="tabular-nums">{formatQuantity(line.quantity)}</span>
            <span className="text-muted-foreground text-xs">({line.locationLabel})</span>
          </div>
        ))}
      </div>
    );
  }

  if (isOutgoingDaybookEntry(row.entry) && hasMultipleOutgoingVarieties(row.entry)) {
    const detailLines = getOutgoingSizeQuantityDetailLines(row.entry, size);

    if (detailLines.length === 0) {
      return <span className="text-muted-foreground">—</span>;
    }

    return (
      <div className="flex flex-col items-end gap-1">
        {detailLines.map((line, index) => (
          <div
            key={`${line.variety}-${line.locationLabel}-${index}`}
            className="flex flex-col items-end gap-0.5"
          >
            <span className="tabular-nums">{formatQuantity(line.quantity)}</span>
            <span className="text-muted-foreground text-xs">({line.locationLabel})</span>
            <span className="text-muted-foreground text-xs">({line.variety})</span>
          </div>
        ))}
      </div>
    );
  }

  const lines = getGatePassSizeQuantityLines(row.entry, size);

  if (lines.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {lines.map((line, index) => (
        <div key={`${line.locationLabel}-${index}`} className="flex flex-col items-end gap-0.5">
          <span className="tabular-nums">{formatQuantity(line.quantity)}</span>
          <span className="text-muted-foreground text-xs">({line.locationLabel})</span>
        </div>
      ))}
    </div>
  );
}

function VarietyCell({ row }: { row: FarmerReportTableRow }) {
  if (isOpeningBalanceRow(row) || !row.entry) {
    return <span className="text-muted-foreground">—</span>;
  }

  if (row.varietySlice) {
    return (
      <span className="block min-w-0 break-words" title={row.varietySlice}>
        {row.varietySlice}
      </span>
    );
  }

  if (isOutgoingDaybookEntry(row.entry) && hasMultipleOutgoingVarieties(row.entry)) {
    const breakdown = getOutgoingVarietyBreakdown(row.entry);

    return (
      <div className="flex min-w-0 flex-col gap-1">
        {breakdown.map((line) => (
          <span
            key={line.variety}
            className="block min-w-0 break-words"
            title={`${line.variety} (${formatQuantity(line.quantity)})`}
          >
            <span className="text-foreground font-medium">{line.variety}</span>
            <span className="text-muted-foreground tabular-nums">
              {' '}
              ({formatQuantity(line.quantity)})
            </span>
          </span>
        ))}
      </div>
    );
  }

  const variety = getGatePassVariety(row.entry);
  return (
    <span className="block min-w-0 break-words" title={variety}>
      {variety}
    </span>
  );
}

const MemoizedSizeQuantityCell = memo(SizeQuantityCell);

function isOpeningBalanceRow(row: FarmerReportTableRow): boolean {
  return row.kind === 'opening-balance';
}

function getRowVarietyGroupingValue(row: FarmerReportTableRow): string {
  if (row.kind === 'opening-balance') return 'Opening Balance';
  if (row.varietySlice) return row.varietySlice;
  if (!row.entry) return '—';
  return getGatePassVariety(row.entry);
}

function getRowStockFilterGroupingValue(row: FarmerReportTableRow): string {
  if (row.kind === 'opening-balance') return 'Opening Balance';
  if (!row.entry) return '—';
  return getGatePassStockFilter(row.entry);
}

function emptyGroupedAggregatedCell() {
  return <span className="text-muted-foreground">—</span>;
}

const noGroupAggregation = () => null;

const columnCache = new Map<string, ColumnDef<FarmerReportTableRow>[]>();

export function getFarmerReportBagSizeSignature(
  rows: DaybookEntry[],
  commodities: CommodityPreference[] = [],
): string {
  return orderBagSizes(collectUniqueBagSizes(rows), commodities).join('\0');
}

function buildFarmerReportColumnsForSizes(
  orderedSizes: string[],
  showCustomMarka: boolean,
  showStockFilter: boolean,
): ColumnDef<FarmerReportTableRow>[] {
  const staticColumns: ColumnDef<FarmerReportTableRow>[] = [
    {
      id: 'date',
      accessorFn: (row) => getRowDateSortValue(row),
      header: 'Date',
      meta: { filterLabel: 'Date' },
      sortingFn: farmerReportNumericSortingFn,
      sortUndefined: 'first',
      aggregationFn: noGroupAggregation,
      aggregatedCell: emptyGroupedAggregatedCell,
      cell: ({ row }) => {
        if (isOpeningBalanceRow(row.original)) {
          return <span className="text-primary font-semibold">Opening Balance</span>;
        }

        if (!row.original.entry) {
          return <span className="text-muted-foreground">—</span>;
        }

        return formatDaybookDate(row.original.entry.date || row.original.entry.createdAt);
      },
    },
    {
      id: 'gatePassNo',
      accessorFn: (row) => row.entry?.gatePassNo ?? null,
      header: 'Gate Pass No',
      meta: { mono: true, numeric: true, filterLabel: 'Gate pass number' },
      sortingFn: farmerReportNumericSortingFn,
      sortUndefined: 'first',
      aggregationFn: noGroupAggregation,
      aggregatedCell: emptyGroupedAggregatedCell,
      cell: ({ row }) => {
        if (isOpeningBalanceRow(row.original) || !row.original.entry) {
          return <span className="text-muted-foreground">—</span>;
        }

        return (
          <span className="font-mono tabular-nums">
            #{row.original.entry.gatePassNo.toLocaleString('en-IN')}
          </span>
        );
      },
    },
    {
      id: 'manualParchiNumber',
      accessorFn: (row) => getRowManualParchiSortValue(row),
      header: 'Manual Parchi No',
      meta: { mono: true, compact: true, numeric: true, filterLabel: 'Manual parchi number' },
      sortingFn: farmerReportNumericSortingFn,
      sortUndefined: 'first',
      aggregationFn: noGroupAggregation,
      aggregatedCell: emptyGroupedAggregatedCell,
      cell: ({ row }) => {
        if (isOpeningBalanceRow(row.original) || !row.original.entry) {
          return <span className="text-muted-foreground">—</span>;
        }

        const manualParchi = formatManualParchi(row.original.entry.manualParchiNumber);

        if (manualParchi === '—') {
          return <span className="text-muted-foreground">—</span>;
        }

        return (
          <span className="font-mono tabular-nums" title={manualParchi}>
            {manualParchi}
          </span>
        );
      },
    },
    {
      id: 'variety',
      accessorFn: (row) => {
        if (row.varietySlice) return row.varietySlice;
        return row.entry ? getGatePassVariety(row.entry) : '—';
      },
      header: 'Variety',
      meta: { groupable: true, wrap: true, filterLabel: 'Variety' },
      enableGrouping: true,
      getGroupingValue: getRowVarietyGroupingValue,
      sortingFn: 'text',
      aggregationFn: noGroupAggregation,
      aggregatedCell: emptyGroupedAggregatedCell,
      cell: ({ row }) => <VarietyCell row={row.original} />,
    },
  ];

  if (showStockFilter) {
    staticColumns.push({
      id: 'stockFilter',
      accessorFn: (row) => (row.entry ? getGatePassStockFilter(row.entry) : '—'),
      header: 'Filter',
      meta: { groupable: true, filterLabel: 'Stock filter' },
      enableGrouping: true,
      getGroupingValue: getRowStockFilterGroupingValue,
      sortingFn: 'text',
      aggregationFn: noGroupAggregation,
      aggregatedCell: emptyGroupedAggregatedCell,
      cell: ({ row }) => {
        if (isOpeningBalanceRow(row.original) || !row.original.entry) {
          return <span className="text-muted-foreground">—</span>;
        }

        const stockFilter = getGatePassStockFilter(row.original.entry);

        return (
          <span className="block min-w-0" title={stockFilter}>
            {stockFilter}
          </span>
        );
      },
    });
  }

  if (showCustomMarka) {
    staticColumns.push({
      id: 'customMarka',
      accessorFn: (row) =>
        row.entry && isIncomingDaybookEntry(row.entry) ? row.entry.customMarka?.trim() || '—' : '—',
      header: 'Marka',
      meta: { compact: true, filterLabel: 'Custom marka' },
      sortingFn: 'text',
      aggregationFn: noGroupAggregation,
      aggregatedCell: emptyGroupedAggregatedCell,
      cell: ({ row }) => {
        if (isOpeningBalanceRow(row.original) || !row.original.entry) {
          return <span className="text-muted-foreground">—</span>;
        }

        const marka = isIncomingDaybookEntry(row.original.entry)
          ? row.original.entry.customMarka?.trim() || '—'
          : '—';

        return (
          <span className="block truncate" title={marka}>
            {marka}
          </span>
        );
      },
    });
  }

  const sizeColumns: ColumnDef<FarmerReportTableRow>[] = orderedSizes.map((size, index) => ({
    id: `size-${size}`,
    accessorFn: (row) => getRowSizeSortValue(row, size),
    header: size,
    meta: {
      align: 'right',
      numeric: true,
      groupStart: index === 0,
      filterLabel: size,
    },
    sortingFn: farmerReportNumericSortingFn,
    sortUndefined: 'last',
    aggregationFn: 'sum',
    aggregatedCell: ({ getValue }) => {
      const value = Number(getValue());
      if (!Number.isFinite(value) || value <= 0) {
        return <span className="text-muted-foreground">—</span>;
      }

      return <span className="font-medium tabular-nums">{formatQuantity(value)}</span>;
    },
    cell: ({ row }) => <MemoizedSizeQuantityCell row={row.original} size={size} />,
  }));

  const trailingColumns: ColumnDef<FarmerReportTableRow>[] = [
    {
      id: 'rowBags',
      accessorFn: (row) => getFarmerReportRowBagTotal(row),
      header: 'Total Bags',
      meta: { align: 'right', numeric: true, filterLabel: 'Total bags' },
      sortingFn: farmerReportNumericSortingFn,
      aggregationFn: 'sum',
      aggregatedCell: ({ getValue }) => {
        const value = Number(getValue());
        if (!Number.isFinite(value) || value <= 0) {
          return <span className="text-muted-foreground">—</span>;
        }

        return <span className="font-medium tabular-nums">{formatQuantity(value)}</span>;
      },
      cell: ({ row }) => <RunningTotalCell value={getFarmerReportRowBagTotal(row.original)} />,
    },
    {
      id: 'totalBags',
      accessorFn: (row) => row.runningTotal,
      header: 'Cumulative Total',
      meta: {
        align: 'right',
        numeric: true,
        filterLabel: 'Cumulative total',
      },
      sortingFn: farmerReportNumericSortingFn,
      aggregationFn: noGroupAggregation,
      aggregatedCell: emptyGroupedAggregatedCell,
      cell: ({ row }) => <CumulativeTotalCell row={row} />,
    },
    {
      id: 'remarks',
      accessorFn: (row) => row.entry?.remarks?.trim() || '—',
      header: 'Remarks',
      meta: { wrap: true, filterLabel: 'Remarks' },
      sortingFn: 'text',
      aggregationFn: noGroupAggregation,
      aggregatedCell: emptyGroupedAggregatedCell,
      cell: ({ row }) => {
        if (isOpeningBalanceRow(row.original)) {
          return <span className="text-muted-foreground">—</span>;
        }

        const remarks = row.original.entry?.remarks?.trim() || '—';
        return (
          <span className="text-muted-foreground" title={remarks}>
            {remarks}
          </span>
        );
      },
    },
  ];

  return [...staticColumns, ...sizeColumns, ...trailingColumns];
}

export function getFarmerReportColumnsForSizes(
  orderedSizes: string[],
  showCustomMarka = false,
  showStockFilter = false,
): ColumnDef<FarmerReportTableRow>[] {
  const cacheKey = `${orderedSizes.join('\0')}|cm:${showCustomMarka}|sf:${showStockFilter}|rb:1`;
  const cached = columnCache.get(cacheKey);
  if (cached) return cached;

  const columns = buildFarmerReportColumnsForSizes(orderedSizes, showCustomMarka, showStockFilter);
  columnCache.set(cacheKey, columns);
  return columns;
}

export function getFarmerReportColumns(
  rows: DaybookEntry[],
  commodities: CommodityPreference[] = [],
  showCustomMarka = false,
  showStockFilter = false,
): ColumnDef<FarmerReportTableRow>[] {
  const orderedSizes = orderBagSizes(collectUniqueBagSizes(rows), commodities);
  return getFarmerReportColumnsForSizes(orderedSizes, showCustomMarka, showStockFilter);
}
