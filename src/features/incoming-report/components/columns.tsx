import type { AggregationFn, ColumnDef, SortingFn } from '@tanstack/react-table';

import type { IncomingBagSize } from '@/features/daybook/types';
import type { IncomingGatePassReportRecord } from '@/features/incoming-report/api/types';

const numberFormatter = new Intl.NumberFormat('en-IN');

export type IncomingQuantityMode = 'current' | 'initial';

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

const reportNumericSortingFn: SortingFn<IncomingGatePassReportRecord> = (rowA, rowB, columnId) => {
  const a = parseReportNumber(rowA.getValue(columnId));
  const b = parseReportNumber(rowB.getValue(columnId));

  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;

  return a === b ? 0 : a > b ? 1 : -1;
};

const reportDateSortingFn: SortingFn<IncomingGatePassReportRecord> = (rowA, rowB, columnId) => {
  const a = parseReportDateValue(rowA.getValue(columnId));
  const b = parseReportDateValue(rowB.getValue(columnId));

  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;

  return a === b ? 0 : a > b ? 1 : -1;
};

export const incomingReportSortingFns = {
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
const reportEmptyAggregation: AggregationFn<IncomingGatePassReportRecord> = () => null;
const reportSumAggregation: AggregationFn<IncomingGatePassReportRecord> = (columnId, leafRows) =>
  leafRows.reduce((sum, row) => {
    const value = row.getValue(columnId);

    return sum + (typeof value === 'number' && Number.isFinite(value) ? value : 0);
  }, 0);
const aggregateNone = { aggregationFn: reportEmptyAggregation };
const aggregateSum = { aggregationFn: reportSumAggregation };

const getBagQuantity = (bag: IncomingBagSize, quantityMode: IncomingQuantityMode) =>
  quantityMode === 'current' ? bag.currentQuantity : bag.initialQuantity;

export function getIncomingReportTotalBags(
  row: IncomingGatePassReportRecord,
  quantityMode: IncomingQuantityMode,
) {
  return quantityMode === 'current' ? row.currentTotal : row.initialTotal;
}

const formatLocation = (location: IncomingBagSize['location']) =>
  [location.chamber, location.floor, location.row].filter(Boolean).join('-');

const getBagSizeQuantity = (
  row: IncomingGatePassReportRecord,
  sizeName: string,
  quantityMode: IncomingQuantityMode,
) =>
  row.bagSizes
    .filter((bag) => bag.name === sizeName)
    .reduce((total, bag) => total + getBagQuantity(bag, quantityMode), 0);

const renderBagSizeValue = (
  bag: IncomingBagSize,
  quantityMode: IncomingQuantityMode,
  showLocation: boolean,
) => {
  const location = showLocation ? formatLocation(bag.location) : null;
  const paltaiLocation =
    showLocation && bag.paltaiLocation ? formatLocation(bag.paltaiLocation) : null;
  const quantity = getBagQuantity(bag, quantityMode);

  return (
    <div className="space-y-0.5 tabular-nums">
      <div className="text-foreground font-semibold">{formatQuantity(quantity)}</div>
      {showLocation ? <div className="text-muted-foreground">{bag.name}</div> : null}
      {location ? <div className="text-muted-foreground">({location})</div> : null}
      {paltaiLocation ? (
        <div className="text-muted-foreground">Paltai: ({paltaiLocation})</div>
      ) : null}
    </div>
  );
};

const baseColumns: ColumnDef<IncomingGatePassReportRecord>[] = [
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
    cell: ({ getValue }) => <span className="tabular-nums">{String(getValue())}</span>,
  },
  {
    accessorKey: 'manualParchiNumber',
    header: 'Manual Parchi No',
    meta: { filterLabel: 'Manual parchi number' },
    ...sortText,
    ...aggregateNone,
    cell: ({ getValue }) => {
      const value = getValue<string | undefined>();

      return value == null || value === '' ? '-' : <span>{value}</span>;
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
    accessorKey: 'variety',
    header: 'Variety',
    meta: { filterLabel: 'Variety' },
    ...sortText,
    ...aggregateNone,
  },
];

const stockFilterColumn: ColumnDef<IncomingGatePassReportRecord> = {
  accessorKey: 'stockFilter',
  header: 'Stock filter',
  meta: { filterLabel: 'Stock filter' },
  ...sortText,
  ...aggregateNone,
  cell: ({ getValue }) => getValue<string | undefined>() || '-',
};

const customMarkaColumn: ColumnDef<IncomingGatePassReportRecord> = {
  accessorKey: 'customMarka',
  header: 'Custom marka',
  meta: { filterLabel: 'Custom marka' },
  ...sortText,
  ...aggregateNone,
  cell: ({ getValue }) => getValue<string | undefined>() || '-',
};

function createTotalBagsColumn(
  quantityMode: IncomingQuantityMode,
): ColumnDef<IncomingGatePassReportRecord> {
  return {
    id: 'totalBags',
    accessorFn: (row) => getIncomingReportTotalBags(row, quantityMode),
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
}

const trailingColumns: ColumnDef<IncomingGatePassReportRecord>[] = [
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

const columnCache = new Map<string, ColumnDef<IncomingGatePassReportRecord>[]>();

export function collectIncomingReportBagSizeNames(rows: IncomingGatePassReportRecord[]): string[] {
  const sizes = new Set<string>();

  for (const row of rows) {
    for (const bag of row.bagSizes) {
      sizes.add(bag.name);
    }
  }

  return Array.from(sizes);
}

function getIncomingReportColumnCacheKey(
  sizes: string[],
  quantityMode: IncomingQuantityMode,
  showCustomMarka: boolean,
  showStockFilter: boolean,
  showLocation: boolean,
) {
  return `${sizes.join('\0')}|${quantityMode}|cm:${showCustomMarka}|sf:${showStockFilter}|sl:${showLocation}`;
}

function buildIncomingReportColumns(
  sizes: string[],
  quantityMode: IncomingQuantityMode,
  showCustomMarka: boolean,
  showStockFilter: boolean,
  showLocation: boolean,
): ColumnDef<IncomingGatePassReportRecord>[] {
  const sizeColumns: ColumnDef<IncomingGatePassReportRecord>[] = sizes.map((sizeName) => ({
    id: `size-${sizeName}`,
    accessorFn: (row) => getBagSizeQuantity(row, sizeName, quantityMode),
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

      const bags = row.original.bagSizes.filter((bag) => bag.name === sizeName);

      if (!bags.length) return '-';

      return (
        <div className="space-y-3">
          {bags.map((bag, index) => (
            <div
              key={`${bag.name}-${bag.location.chamber}-${bag.location.floor}-${bag.location.row}-${index}`}
            >
              {renderBagSizeValue(bag, quantityMode, showLocation)}
            </div>
          ))}
        </div>
      );
    },
  }));

  const preferenceColumns: ColumnDef<IncomingGatePassReportRecord>[] = [];

  if (showStockFilter) {
    preferenceColumns.push(stockFilterColumn);
  }

  if (showCustomMarka) {
    preferenceColumns.push(customMarkaColumn);
  }

  return [
    ...baseColumns,
    ...preferenceColumns,
    createTotalBagsColumn(quantityMode),
    ...sizeColumns,
    ...trailingColumns,
  ];
}

export function getIncomingReportColumns(
  rows: IncomingGatePassReportRecord[],
  quantityMode: IncomingQuantityMode = 'current',
  showCustomMarka = false,
  showStockFilter = false,
  showLocation = true,
): ColumnDef<IncomingGatePassReportRecord>[] {
  const sizes = collectIncomingReportBagSizeNames(rows);
  const cacheKey = getIncomingReportColumnCacheKey(
    sizes,
    quantityMode,
    showCustomMarka,
    showStockFilter,
    showLocation,
  );
  const cached = columnCache.get(cacheKey);

  if (cached) return cached;

  const columns = buildIncomingReportColumns(
    sizes,
    quantityMode,
    showCustomMarka,
    showStockFilter,
    showLocation,
  );
  columnCache.set(cacheKey, columns);

  return columns;
}

export const columns: ColumnDef<IncomingGatePassReportRecord>[] = getIncomingReportColumns([]);
