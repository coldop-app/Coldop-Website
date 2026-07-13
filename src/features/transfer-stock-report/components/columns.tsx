import type { AggregationFn, ColumnDef, SortingFn } from '@tanstack/react-table';

import type { DaybookLocation } from '@/features/daybook/types';
import type {
  TransferStockReportItem,
  TransferStockReportRecord,
} from '@/features/transfer-stock-report/api/types';

const numberFormatter = new Intl.NumberFormat('en-IN');

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

const reportNumericSortingFn: SortingFn<TransferStockReportRecord> = (rowA, rowB, columnId) => {
  const a = parseReportNumber(rowA.getValue(columnId));
  const b = parseReportNumber(rowB.getValue(columnId));

  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;

  return a === b ? 0 : a > b ? 1 : -1;
};

const reportDateSortingFn: SortingFn<TransferStockReportRecord> = (rowA, rowB, columnId) => {
  const a = parseReportDateValue(rowA.getValue(columnId));
  const b = parseReportDateValue(rowB.getValue(columnId));

  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;

  return a === b ? 0 : a > b ? 1 : -1;
};

export const transferStockReportSortingFns = {
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
const reportEmptyAggregation: AggregationFn<TransferStockReportRecord> = () => null;
const reportSumAggregation: AggregationFn<TransferStockReportRecord> = (columnId, leafRows) =>
  leafRows.reduce((sum, row) => {
    const value = row.getValue(columnId);

    return sum + (typeof value === 'number' && Number.isFinite(value) ? value : 0);
  }, 0);
const aggregateNone = { aggregationFn: reportEmptyAggregation };
const aggregateSum = { aggregationFn: reportSumAggregation };

const formatLocation = (location?: DaybookLocation) =>
  location ? [location.chamber, location.floor, location.row].filter(Boolean).join('-') : null;

export function getSourceGatePassNos(row: TransferStockReportRecord): string {
  const unique = [...new Set(row.items.map((item) => item.gatePassNo))];
  return unique
    .sort((a, b) => a - b)
    .map(String)
    .join(', ');
}

const getBagSizeQuantity = (row: TransferStockReportRecord, bagSizeName: string) =>
  row.items
    .filter((item) => item.bagSize === bagSizeName)
    .reduce((total, item) => total + item.quantity, 0);

const renderItemValue = (item: TransferStockReportItem) => {
  const location = formatLocation(item.location);

  return (
    <div className="space-y-0.5 tabular-nums">
      <div className="text-foreground font-semibold">{formatQuantity(item.quantity)}</div>
      <div className="text-muted-foreground">{item.bagSize}</div>
      {location ? <div className="text-muted-foreground">({location})</div> : null}
      <div className="text-muted-foreground">GP {item.gatePassNo}</div>
    </div>
  );
};

const baseColumns: ColumnDef<TransferStockReportRecord>[] = [
  {
    accessorKey: 'gatePassNo',
    header: 'Gate Pass No',
    meta: { filterLabel: 'Gate pass number', numeric: true },
    ...sortNumeric,
    ...aggregateNone,
    cell: ({ getValue }) => <span className="tabular-nums">{String(getValue())}</span>,
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
    id: 'fromName',
    accessorFn: (row) => row.fromFarmerStorageLinkId.name,
    header: 'From Name',
    meta: { emphasize: true, filterLabel: 'From farmer' },
    ...sortText,
    ...aggregateNone,
  },
  {
    id: 'fromAccountNumber',
    accessorFn: (row) => row.fromFarmerStorageLinkId.accountNumber,
    header: 'From Account',
    meta: { filterLabel: 'From account number', numeric: true },
    ...sortNumeric,
    ...aggregateNone,
    cell: ({ getValue }) => <span className="tabular-nums">{String(getValue())}</span>,
  },
  {
    id: 'fromAddress',
    accessorFn: (row) => row.fromFarmerStorageLinkId.address ?? '-',
    header: 'From Address',
    meta: { filterLabel: 'From address', wrap: true },
    ...sortText,
    ...aggregateNone,
  },
  {
    id: 'fromMobile',
    accessorFn: (row) => row.fromFarmerStorageLinkId.mobileNumber ?? '-',
    header: 'From Mobile',
    meta: { filterLabel: 'From mobile', mono: true },
    ...sortText,
    ...aggregateNone,
  },
  {
    id: 'toName',
    accessorFn: (row) => row.toFarmerStorageLinkId.name,
    header: 'To Name',
    meta: { emphasize: true, filterLabel: 'To farmer' },
    ...sortText,
    ...aggregateNone,
  },
  {
    id: 'toAccountNumber',
    accessorFn: (row) => row.toFarmerStorageLinkId.accountNumber,
    header: 'To Account',
    meta: { filterLabel: 'To account number', numeric: true },
    ...sortNumeric,
    ...aggregateNone,
    cell: ({ getValue }) => <span className="tabular-nums">{String(getValue())}</span>,
  },
  {
    id: 'toAddress',
    accessorFn: (row) => row.toFarmerStorageLinkId.address ?? '-',
    header: 'To Address',
    meta: { filterLabel: 'To address', wrap: true },
    ...sortText,
    ...aggregateNone,
  },
  {
    id: 'toMobile',
    accessorFn: (row) => row.toFarmerStorageLinkId.mobileNumber ?? '-',
    header: 'To Mobile',
    meta: { filterLabel: 'To mobile', mono: true },
    ...sortText,
    ...aggregateNone,
  },
  {
    id: 'sourceGatePassNos',
    accessorFn: (row) => getSourceGatePassNos(row),
    header: 'Source GP No',
    meta: { filterLabel: 'Source gate pass number', mono: true },
    ...sortText,
    ...aggregateNone,
    cell: ({ getValue }) => getValue<string>() || '-',
  },
  {
    accessorKey: 'customMarka',
    header: 'Custom Marka',
    meta: { filterLabel: 'Custom marka' },
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

const totalBagsColumn: ColumnDef<TransferStockReportRecord> = {
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

const trailingColumns: ColumnDef<TransferStockReportRecord>[] = [
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

const columnCache = new Map<string, ColumnDef<TransferStockReportRecord>[]>();

export function collectTransferStockReportBagSizeNames(
  rows: TransferStockReportRecord[],
): string[] {
  const sizes = new Set<string>();

  for (const row of rows) {
    for (const item of row.items) {
      sizes.add(item.bagSize);
    }
  }

  return Array.from(sizes);
}

function buildTransferStockReportColumns(sizes: string[]): ColumnDef<TransferStockReportRecord>[] {
  const sizeColumns: ColumnDef<TransferStockReportRecord>[] = sizes.map((bagSizeName) => ({
    id: `size-${bagSizeName}`,
    accessorFn: (row) => getBagSizeQuantity(row, bagSizeName),
    header: bagSizeName,
    meta: {
      align: 'right',
      filterLabel: bagSizeName,
      groupStart: true,
      numeric: true,
    },
    ...sortNumeric,
    ...aggregateSum,
    cell: ({ cell, getValue, row }) => {
      if (cell.getIsAggregated()) {
        return <span className="tabular-nums">{formatQuantity(getValue<number>() ?? 0)}</span>;
      }

      const items = row.original.items.filter((item) => item.bagSize === bagSizeName);

      if (!items.length) return '-';

      return (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={`${item.bagSize}-${item.location?.chamber ?? ''}-${item.location?.floor ?? ''}-${item.location?.row ?? ''}-${item.gatePassNo}-${index}`}
            >
              {renderItemValue(item)}
            </div>
          ))}
        </div>
      );
    },
  }));

  return [...baseColumns, totalBagsColumn, ...sizeColumns, ...trailingColumns];
}

export function getTransferStockReportColumns(
  rows: TransferStockReportRecord[],
): ColumnDef<TransferStockReportRecord>[] {
  const sizes = collectTransferStockReportBagSizeNames(rows);
  const cacheKey = sizes.join('\0');
  const cached = columnCache.get(cacheKey);

  if (cached) return cached;

  const columns = buildTransferStockReportColumns(sizes);
  columnCache.set(cacheKey, columns);

  return columns;
}

export const columns: ColumnDef<TransferStockReportRecord>[] = getTransferStockReportColumns([]);

export const DEFAULT_HIDDEN_COLUMN_IDS = [
  'fromAddress',
  'toAddress',
  'fromMobile',
  'toMobile',
] as const;
