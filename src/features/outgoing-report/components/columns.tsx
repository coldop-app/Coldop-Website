import type { AggregationFn, ColumnDef, SortingFn } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import type { DaybookLocation } from '@/features/daybook/types';
import type {
  OutgoingGatePassReportRecord,
  OutgoingReportOrderDetail,
} from '@/features/outgoing-report/api/types';
import {
  getOrderLineQuantity,
  getOutgoingReportSizeQuantityDetailLines,
  getOutgoingReportType,
  getOutgoingReportVariety,
  getOutgoingReportVarietyBreakdown,
  hasMultipleOutgoingReportVarieties,
} from '@/features/outgoing-report/utils/report-row-values';

const numberFormatter = new Intl.NumberFormat('en-IN');

export type OutgoingQuantityMode = 'issued' | 'available';

function parseReportNumber(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (value == null || value === '') return null;

  const parsed = Number(String(value).replaceAll(',', '').trim());

  return Number.isFinite(parsed) ? parsed : null;
}

function parseReportDateValue(value: unknown): number | null {
  if (value == null || value === '') return null;

  const parsed = new Date(String(value));
  const timestamp = parsed.getTime();

  return Number.isNaN(timestamp) ? null : timestamp;
}

const reportNumericSortingFn: SortingFn<OutgoingGatePassReportRecord> = (rowA, rowB, columnId) => {
  const a = parseReportNumber(rowA.getValue(columnId));
  const b = parseReportNumber(rowB.getValue(columnId));

  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;

  return a === b ? 0 : a > b ? 1 : -1;
};

const reportDateSortingFn: SortingFn<OutgoingGatePassReportRecord> = (rowA, rowB, columnId) => {
  const a = parseReportDateValue(rowA.getValue(columnId));
  const b = parseReportDateValue(rowB.getValue(columnId));

  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;

  return a === b ? 0 : a > b ? 1 : -1;
};

export const outgoingReportSortingFns = {
  reportNumeric: reportNumericSortingFn,
  reportDate: reportDateSortingFn,
};

const formatDate = (date: string) => {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate);
};

const formatQuantity = (quantity: number) => numberFormatter.format(quantity);
const sortText = { sortingFn: 'text' as const, sortUndefined: 'last' as const };
const sortNumeric = {
  sortingFn: reportNumericSortingFn,
  sortUndefined: 'last' as const,
};
const sortDate = {
  sortingFn: reportDateSortingFn,
  sortUndefined: 'last' as const,
};
const reportEmptyAggregation: AggregationFn<OutgoingGatePassReportRecord> = () => null;
const reportSumAggregation: AggregationFn<OutgoingGatePassReportRecord> = (columnId, leafRows) =>
  leafRows.reduce((sum, row) => {
    const value = row.getValue(columnId);

    return sum + (typeof value === 'number' && Number.isFinite(value) ? value : 0);
  }, 0);
const aggregateNone = { aggregationFn: reportEmptyAggregation };
const aggregateSum = { aggregationFn: reportSumAggregation };

const formatLocation = (location?: DaybookLocation) =>
  location ? [location.chamber, location.floor, location.row].filter(Boolean).join('-') : null;

const getOrderSizeQuantity = (
  row: OutgoingGatePassReportRecord,
  sizeName: string,
  quantityMode: OutgoingQuantityMode,
) =>
  row.orderDetails
    .filter((detail) => detail.size === sizeName)
    .reduce((total, detail) => total + getOrderLineQuantity(detail, quantityMode), 0);

const renderOrderDetailValue = (
  detail: OutgoingReportOrderDetail,
  quantityMode: OutgoingQuantityMode,
  showLocation: boolean,
) => {
  const location = showLocation ? formatLocation(detail.location) : null;
  const quantity = getOrderLineQuantity(detail, quantityMode);

  return (
    <div className="space-y-0.5 tabular-nums">
      <div className="text-foreground font-semibold">{formatQuantity(quantity)}</div>
      {showLocation ? <div className="text-muted-foreground">{detail.size}</div> : null}
      {location ? <div className="text-muted-foreground">({location})</div> : null}
    </div>
  );
};

function renderMultiVarietySizeDetailLine(
  line: ReturnType<typeof getOutgoingReportSizeQuantityDetailLines>[number],
  showLocation: boolean,
) {
  return (
    <div className="flex flex-col items-end gap-0.5 tabular-nums">
      <span className="text-foreground font-semibold">{formatQuantity(line.quantity)}</span>
      {showLocation && line.locationLabel ? (
        <span className="text-muted-foreground text-xs">({line.locationLabel})</span>
      ) : null}
      <span className="text-muted-foreground text-xs">({line.variety})</span>
    </div>
  );
}

function renderVarietyCell(row: OutgoingGatePassReportRecord, quantityMode: OutgoingQuantityMode) {
  if (row.varietySlice) {
    return row.varietySlice;
  }

  if (hasMultipleOutgoingReportVarieties(row, quantityMode)) {
    const breakdown = getOutgoingReportVarietyBreakdown(row, quantityMode);

    return (
      <div className="flex min-w-0 flex-col gap-1">
        {breakdown.map((line) => (
          <div key={line.variety} className="flex min-w-0 items-baseline justify-between gap-2">
            <span className="min-w-0 break-words" title={line.variety}>
              {line.variety}
            </span>
            <span className="text-muted-foreground shrink-0 tabular-nums">
              {formatQuantity(line.quantity)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return getOutgoingReportVariety(row) || '-';
}

const buildBaseColumns = (
  quantityMode: OutgoingQuantityMode,
): ColumnDef<OutgoingGatePassReportRecord>[] => [
  {
    id: 'name',
    accessorFn: (row) => row.farmerStorageLinkId.name,
    header: 'Name',
    meta: { emphasize: true, filterLabel: 'Farmer' },
    ...sortText,
    ...aggregateNone,
  },
  {
    id: 'address',
    accessorFn: (row) => row.farmerStorageLinkId.address ?? '-',
    header: 'Address',
    meta: { filterLabel: 'Farmer address', wrap: true },
    ...sortText,
    ...aggregateNone,
  },
  {
    id: 'accountNumber',
    accessorFn: (row) => row.farmerStorageLinkId.accountNumber,
    header: 'Account Number',
    meta: { filterLabel: 'Account number', numeric: true },
    ...sortNumeric,
    ...aggregateNone,
    cell: ({ getValue }) => <span className="tabular-nums">{String(getValue())}</span>,
  },
  {
    accessorKey: 'gatePassNo',
    header: 'Gate Pass No',
    meta: { filterLabel: 'Gate pass number', numeric: true },
    ...sortNumeric,
    ...aggregateNone,
    cell: ({ getValue, row }) => {
      const value = getValue<number>();

      return (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="tabular-nums">{String(value)}</span>
          {row.original.isNull ? (
            <Badge variant="secondary" className="text-xs">
              Nulled
            </Badge>
          ) : null}
        </div>
      );
    },
  },
  {
    accessorKey: 'manualParchiNumber',
    header: 'Manual Parchi No',
    meta: { filterLabel: 'Manual parchi number', numeric: true },
    ...sortNumeric,
    ...aggregateNone,
    cell: ({ getValue }) => {
      const value = getValue<number | undefined>();

      return value == null ? '-' : <span className="tabular-nums">{String(value)}</span>;
    },
  },
  {
    accessorKey: 'date',
    header: 'Date',
    meta: {
      filterLabel: 'Date',
      filterValueFormatter: (value) => formatDate(String(value ?? '')),
      mono: true,
    },
    ...sortDate,
    ...aggregateNone,
    cell: ({ getValue }) => formatDate(getValue<string>()),
  },
  {
    id: 'type',
    accessorFn: (row) => getOutgoingReportType(row),
    header: 'Type',
    meta: { filterLabel: 'Type' },
    ...sortText,
    ...aggregateNone,
    cell: ({ getValue }) => getValue<string>() || '-',
  },
  {
    id: 'variety',
    accessorFn: (row) => getOutgoingReportVariety(row),
    header: 'Variety',
    meta: { filterLabel: 'Variety', wrap: true },
    ...sortText,
    ...aggregateNone,
    cell: ({ row }) => renderVarietyCell(row.original, quantityMode),
  },
];

const routeColumns: ColumnDef<OutgoingGatePassReportRecord>[] = [
  {
    accessorKey: 'from',
    header: 'From',
    meta: { filterLabel: 'From' },
    ...sortText,
    ...aggregateNone,
    cell: ({ getValue }) => getValue<string | undefined>() || '-',
  },
  {
    accessorKey: 'to',
    header: 'To',
    meta: { filterLabel: 'To' },
    ...sortText,
    ...aggregateNone,
    cell: ({ getValue }) => getValue<string | undefined>() || '-',
  },
  {
    accessorKey: 'truckNumber',
    header: 'Truck No',
    meta: { filterLabel: 'Truck number', mono: true },
    ...sortText,
    ...aggregateNone,
    cell: ({ getValue }) => getValue<string | undefined>() || '-',
  },
];

const stockFilterColumn: ColumnDef<OutgoingGatePassReportRecord> = {
  accessorKey: 'stockFilter',
  header: 'Stock filter',
  meta: { filterLabel: 'Stock filter' },
  ...sortText,
  ...aggregateNone,
  cell: ({ getValue }) => getValue<string | undefined>() || '-',
};

const totalBagsColumn: ColumnDef<OutgoingGatePassReportRecord> = {
  accessorKey: 'totalBags',
  header: () => (
    <span className="flex min-w-0 flex-col gap-0.5">
      <span className="truncate text-sm leading-tight font-medium">Total</span>
      <span className="text-xs font-normal opacity-70">bags</span>
    </span>
  ),
  meta: {
    align: 'right',
    filterLabel: 'Total bags',
    groupStart: true,
    numeric: true,
  },
  ...sortNumeric,
  ...aggregateSum,
  cell: ({ getValue }) => {
    const value = getValue<number | undefined>();

    return value == null ? (
      '-'
    ) : (
      <span className="font-medium tabular-nums">{formatQuantity(value)}</span>
    );
  },
};

const trailingColumns: ColumnDef<OutgoingGatePassReportRecord>[] = [
  {
    id: 'createdBy',
    accessorFn: (row) => row.createdBy?.name ?? '-',
    header: 'Created By',
    meta: { filterLabel: 'Created by' },
    ...sortText,
    ...aggregateNone,
  },
  {
    accessorKey: 'remarks',
    header: 'Remarks',
    meta: { filterLabel: 'Remarks', wrap: true },
    ...sortText,
    ...aggregateNone,
    cell: ({ getValue }) => getValue<string | undefined>() || '-',
  },
];

const columnCache = new Map<string, ColumnDef<OutgoingGatePassReportRecord>[]>();

export function collectOutgoingReportOrderSizeNames(
  rows: OutgoingGatePassReportRecord[],
): string[] {
  const sizes = new Set<string>();

  for (const row of rows) {
    for (const detail of row.orderDetails) {
      sizes.add(detail.size);
    }
  }

  return Array.from(sizes);
}

function getOutgoingReportColumnCacheKey(
  sizes: string[],
  quantityMode: OutgoingQuantityMode,
  showStockFilter: boolean,
  showLocation: boolean,
) {
  return `${sizes.join('\0')}|${quantityMode}|sf:${showStockFilter}|sl:${showLocation}`;
}

function buildOutgoingReportColumns(
  sizes: string[],
  quantityMode: OutgoingQuantityMode,
  showStockFilter: boolean,
  showLocation: boolean,
): ColumnDef<OutgoingGatePassReportRecord>[] {
  const sizeColumns: ColumnDef<OutgoingGatePassReportRecord>[] = sizes.map((sizeName) => ({
    id: `size-${sizeName}`,
    accessorFn: (row) => getOrderSizeQuantity(row, sizeName, quantityMode),
    header: sizeName,
    meta: {
      align: 'right',
      filterLabel: sizeName,
      groupStart: true,
      numeric: true,
    },
    ...sortNumeric,
    ...aggregateSum,
    cell: ({ cell, getValue, row }) => {
      if (cell.getIsAggregated()) {
        return <span className="tabular-nums">{formatQuantity(getValue<number>() ?? 0)}</span>;
      }

      const details = row.original.orderDetails.filter((detail) => detail.size === sizeName);

      if (!details.length) return '-';

      if (
        !row.original.varietySlice &&
        hasMultipleOutgoingReportVarieties(row.original, quantityMode)
      ) {
        const detailLines = getOutgoingReportSizeQuantityDetailLines(
          row.original,
          sizeName,
          quantityMode,
        );

        if (!detailLines.length) return '-';

        return (
          <div className="space-y-3">
            {detailLines.map((line, index) => (
              <div key={`${line.variety}-${line.locationLabel ?? 'none'}-${index}`}>
                {renderMultiVarietySizeDetailLine(line, showLocation)}
              </div>
            ))}
          </div>
        );
      }

      return (
        <div className="space-y-3">
          {details.map((detail, index) => (
            <div
              key={`${detail.size}-${detail.location?.chamber ?? ''}-${detail.location?.floor ?? ''}-${detail.location?.row ?? ''}-${index}`}
            >
              {renderOrderDetailValue(detail, quantityMode, showLocation)}
            </div>
          ))}
        </div>
      );
    },
  }));

  return [
    ...buildBaseColumns(quantityMode),
    ...(showStockFilter ? [stockFilterColumn] : []),
    ...routeColumns,
    totalBagsColumn,
    ...sizeColumns,
    ...trailingColumns,
  ];
}

export function getOutgoingReportColumns(
  rows: OutgoingGatePassReportRecord[],
  quantityMode: OutgoingQuantityMode = 'issued',
  showStockFilter = false,
  showLocation = true,
): ColumnDef<OutgoingGatePassReportRecord>[] {
  const sizes = collectOutgoingReportOrderSizeNames(rows);
  const cacheKey = getOutgoingReportColumnCacheKey(
    sizes,
    quantityMode,
    showStockFilter,
    showLocation,
  );
  const cached = columnCache.get(cacheKey);

  if (cached) return cached;

  const columns = buildOutgoingReportColumns(sizes, quantityMode, showStockFilter, showLocation);
  columnCache.set(cacheKey, columns);

  return columns;
}

export const columns: ColumnDef<OutgoingGatePassReportRecord>[] = getOutgoingReportColumns([]);
