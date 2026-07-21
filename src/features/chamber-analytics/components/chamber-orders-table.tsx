import { useRef, useState, type ReactNode } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type SortingFn,
  type SortingState,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDaybookDate, formatQuantity, locationKey } from '@/features/daybook/utils/format';
import { formatPaltaiLocationsList } from '@/features/incoming/utils/paltai-location';
import { cn } from '@/lib/utils';

import type { FilteredChamberOrder } from '../utils/filter-chamber-orders';
import { getEffectiveAnalyticsBagLocation } from '../utils/get-effective-analytics-location';

type ChamberOrdersTableProps = {
  orders: FilteredChamberOrder[];
  chamberLabel: string;
  floorLabel: string;
};

type ColumnMeta = {
  align?: 'left' | 'right';
  emphasize?: boolean;
  mono?: boolean;
  numeric?: boolean;
};

const TABLE_GRID_CLASS = cn(
  'border-collapse',
  '[&_th]:border-b [&_th]:border-r [&_td]:border-b [&_td]:border-r',
  '[&_th]:border-border/50 [&_td]:border-border/35',
  '[&_th:first-child]:border-l [&_td:first-child]:border-l',
  '[&_thead_th]:border-t [&_thead_th]:border-b-2 [&_thead_th]:border-b-border/60',
  '[&_th:last-child]:border-r-0 [&_td:last-child]:border-r-0',
);

const FIXED_CELL_CLASS = cn(
  'max-w-0 min-w-0 !whitespace-normal break-words [overflow-wrap:anywhere]',
);

const COLUMN_WIDTHS: Record<string, string> = {
  gatePassNo: '5.5rem',
  date: '7.5rem',
  farmerName: '14rem',
  variety: '8rem',
  size: '8rem',
  row: '6rem',
  bags: '5.5rem',
};

function SortIcon({ sorted }: { sorted: false | 'asc' | 'desc' }) {
  if (sorted === 'desc') {
    return <ArrowDown className="size-3.5 shrink-0" aria-hidden />;
  }

  if (sorted === 'asc') {
    return <ArrowUp className="size-3.5 shrink-0" aria-hidden />;
  }

  return <ArrowUpDown className="size-3.5 shrink-0" aria-hidden />;
}

function getColumnAlign(meta: ColumnMeta | undefined): 'left' | 'right' {
  return meta?.align ?? 'left';
}

function getHeadClassName(meta: ColumnMeta | undefined, isHeaderScrolled: boolean) {
  const align = getColumnAlign(meta);

  return cn(
    FIXED_CELL_CLASS,
    'h-11 px-3 py-2 align-middle text-sm font-semibold transition-[background-color,color] duration-200',
    isHeaderScrolled
      ? 'bg-muted/60 text-foreground backdrop-blur-sm supports-[backdrop-filter]:bg-muted/55'
      : 'bg-secondary text-secondary-foreground',
    meta?.numeric === true && 'tabular-nums',
    align === 'right' && 'text-right',
  );
}

function getCellClassName(meta: ColumnMeta | undefined) {
  const align = getColumnAlign(meta);

  return cn(
    FIXED_CELL_CLASS,
    'px-3 py-3 align-top text-sm leading-relaxed text-foreground',
    meta?.numeric === true && 'tabular-nums font-medium',
    meta?.mono === true && 'font-mono',
    meta?.emphasize === true && 'font-medium',
    align === 'right' && 'text-right',
  );
}

function getFooterClassName(meta: ColumnMeta | undefined) {
  const align = getColumnAlign(meta);

  return cn(
    FIXED_CELL_CLASS,
    'h-11 bg-muted/70 px-3 py-2 align-middle text-sm font-semibold text-foreground backdrop-blur-sm supports-[backdrop-filter]:bg-muted/65',
    meta?.numeric === true && 'tabular-nums',
    align === 'right' && 'text-right',
  );
}

function DataTableColumnHeader<TData, TValue>({
  column,
  sorted,
  align,
  children,
}: {
  column: Column<TData, TValue>;
  sorted: false | 'asc' | 'desc';
  align: 'left' | 'right';
  children: ReactNode;
}) {
  if (!column.getCanSort()) {
    return (
      <div
        className={cn('flex h-8 items-center', align === 'right' ? 'justify-end' : 'justify-start')}
      >
        {children}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={cn(
        'flex w-full min-w-0 items-start gap-1.5 rounded-md text-inherit transition-colors',
        '[overflow-wrap:anywhere] break-words',
        'hover:text-foreground focus-visible:ring-ring/30 focus-visible:ring-2 focus-visible:outline-none',
        align === 'right' ? 'justify-end text-right' : 'justify-between text-left',
      )}
      onClick={column.getToggleSortingHandler()}
    >
      {children}
      <span
        className={cn(
          'text-muted-foreground shrink-0 transition-opacity',
          sorted ? 'opacity-100' : 'opacity-0 group-hover/head:opacity-70',
        )}
      >
        <SortIcon sorted={sorted} />
      </span>
    </button>
  );
}

const numericSortingFn: SortingFn<FilteredChamberOrder> = (rowA, rowB, columnId) => {
  const a = Number(rowA.getValue(columnId));
  const b = Number(rowB.getValue(columnId));
  if (Number.isNaN(a) && Number.isNaN(b)) return 0;
  if (Number.isNaN(a)) return -1;
  if (Number.isNaN(b)) return 1;
  return a - b;
};

const dateSortingFn: SortingFn<FilteredChamberOrder> = (rowA, rowB, columnId) => {
  const a = new Date(String(rowA.getValue(columnId))).getTime();
  const b = new Date(String(rowB.getValue(columnId))).getTime();
  if (Number.isNaN(a) && Number.isNaN(b)) return 0;
  if (Number.isNaN(a)) return -1;
  if (Number.isNaN(b)) return 1;
  return a - b;
};

const sortText = { sortingFn: 'text' as const, sortUndefined: 'last' as const };
const sortNumeric = {
  sortingFn: numericSortingFn,
  sortUndefined: 'last' as const,
};
const sortDate = {
  sortingFn: dateSortingFn,
  sortUndefined: 'last' as const,
};

function bagSizeLabel(order: FilteredChamberOrder) {
  return order.bagSizes.map((bag) => bag.name).join(', ');
}

function bagRowLabel(order: FilteredChamberOrder) {
  return order.bagSizes
    .map((bag) => getEffectiveAnalyticsBagLocation(bag).row || '—')
    .join(', ');
}

const columns: ColumnDef<FilteredChamberOrder, unknown>[] = [
  {
    id: 'gatePassNo',
    accessorFn: (row) => row.order.gatePassNo,
    header: 'GP #',
    meta: { mono: true, numeric: true } satisfies ColumnMeta,
    ...sortNumeric,
    cell: ({ row }) => row.original.order.gatePassNo,
  },
  {
    id: 'date',
    accessorFn: (row) => row.order.date,
    header: 'Date',
    meta: { numeric: true } satisfies ColumnMeta,
    ...sortDate,
    cell: ({ row }) => formatDaybookDate(row.original.order.date),
  },
  {
    id: 'farmerName',
    accessorFn: (row) => row.order.farmerName,
    header: 'Farmer',
    meta: { emphasize: true } satisfies ColumnMeta,
    ...sortText,
    cell: ({ row }) => {
      const name = row.original.order.farmerName;
      return (
        <span className="block truncate" title={name}>
          {name}
        </span>
      );
    },
  },
  {
    id: 'variety',
    accessorFn: (row) => row.order.variety,
    header: 'Variety',
    ...sortText,
    cell: ({ row }) => row.original.order.variety,
  },
  {
    id: 'size',
    accessorFn: bagSizeLabel,
    header: 'Size',
    ...sortText,
    cell: ({ row }) => (
      <ul className="space-y-1">
        {row.original.bagSizes.map((bag) => (
          <li
            key={`${bag.name}-${locationKey(bag.location)}`}
            className="text-foreground font-medium"
          >
            {bag.name}
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: 'row',
    accessorFn: bagRowLabel,
    header: 'Row',
    meta: { numeric: true } satisfies ColumnMeta,
    ...sortText,
    cell: ({ row }) => (
      <ul className="space-y-1">
        {row.original.bagSizes.map((bag) => {
          const effectiveLocation = getEffectiveAnalyticsBagLocation(bag);
          const paltaiHistory = formatPaltaiLocationsList(bag.paltaiLocation);

          return (
            <li
              key={`row-${bag.name}-${locationKey(bag.location)}`}
              className="text-foreground tabular-nums"
              title={paltaiHistory ? `Paltai: ${paltaiHistory}` : undefined}
            >
              {effectiveLocation.row || '—'}
            </li>
          );
        })}
      </ul>
    ),
  },
  {
    id: 'bags',
    accessorFn: (row) => row.totalBags,
    header: 'Bags',
    meta: { align: 'right', numeric: true } satisfies ColumnMeta,
    ...sortNumeric,
    cell: ({ row }) => formatQuantity(row.original.totalBags),
  },
];

export function ChamberOrdersTable({ orders, chamberLabel, floorLabel }: ChamberOrdersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [isFooterElevated, setIsFooterElevated] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    sortDescFirst: false,
    enableSortingRemoval: true,
    state: { sorting },
    getRowId: (row) => row.order._id,
  });

  const leafColumns = table.getAllLeafColumns();
  const tableMinWidth = leafColumns.reduce((sum, column) => {
    const width = COLUMN_WIDTHS[column.id] ?? '8rem';
    return sum + (Number.parseFloat(width) || 8);
  }, 0);

  const rows = table.getRowModel().rows;
  const totalBags = rows.reduce((sum, row) => sum + row.original.totalBags, 0);

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="font-heading text-foreground text-base font-semibold">
          You are viewing gate passes for chamber {chamberLabel} and floor {floorLabel}.
        </CardTitle>
      </CardHeader>

      <CardContent>
        {orders.length === 0 ? (
          <p className="text-muted-foreground text-sm">No gate passes on this floor.</p>
        ) : (
          <div className="border-border min-w-0 overflow-hidden rounded-lg border">
            <div
              ref={scrollContainerRef}
              onScroll={(event) => {
                const target = event.currentTarget;
                setIsHeaderScrolled(target.scrollTop > 0);
                setIsFooterElevated(
                  target.scrollTop + target.clientHeight < target.scrollHeight - 1,
                );
              }}
              className="max-h-[min(70vh,42rem)] overflow-auto **:data-[slot=table-container]:overflow-visible"
            >
              <Table
                className={cn(TABLE_GRID_CLASS, 'table-fixed')}
                style={{ minWidth: `${tableMinWidth}rem` }}
              >
                <colgroup>
                  {leafColumns.map((column) => (
                    <col
                      key={column.id}
                      style={{
                        width: COLUMN_WIDTHS[column.id] ?? '8rem',
                      }}
                    />
                  ))}
                </colgroup>

                <TableHeader
                  className={cn(
                    'sticky top-0 z-10 [&_tr]:border-0 [&_tr]:hover:bg-transparent',
                    isHeaderScrolled && 'shadow-border/80 shadow-[0_1px_0_0]',
                  )}
                >
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="border-0">
                      {headerGroup.headers.map((header) => {
                        const meta = header.column.columnDef.meta as ColumnMeta | undefined;
                        const align = getColumnAlign(meta);
                        const sorted = header.column.getIsSorted();
                        const columnWidth = COLUMN_WIDTHS[header.column.id] ?? '8rem';

                        return (
                          <TableHead
                            key={header.id}
                            className={cn('group/head', getHeadClassName(meta, isHeaderScrolled))}
                            style={{ width: columnWidth }}
                            aria-sort={
                              sorted === 'asc'
                                ? 'ascending'
                                : sorted === 'desc'
                                  ? 'descending'
                                  : 'none'
                            }
                          >
                            {header.isPlaceholder ? null : (
                              <DataTableColumnHeader
                                column={header.column}
                                sorted={sorted}
                                align={align}
                              >
                                {flexRender(header.column.columnDef.header, header.getContext())}
                              </DataTableColumnHeader>
                            )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>

                <TableBody className="[&_tr:last-child]:border-0">
                  {rows.map((row) => (
                    <TableRow key={row.id} className="even:bg-muted/20 hover:bg-muted/40 border-0">
                      {row.getVisibleCells().map((cell) => {
                        const meta = cell.column.columnDef.meta as ColumnMeta | undefined;
                        const columnWidth = COLUMN_WIDTHS[cell.column.id] ?? '8rem';

                        return (
                          <TableCell
                            key={cell.id}
                            className={getCellClassName(meta)}
                            style={{ width: columnWidth }}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>

                <TableFooter
                  className={cn(
                    'sticky bottom-0 z-10 border-0 bg-transparent [&>tr]:border-0',
                    isFooterElevated && 'shadow-border/80 shadow-[0_-1px_0_0]',
                  )}
                >
                  <TableRow className="border-0 hover:bg-transparent">
                    {leafColumns.map((column, columnIndex) => {
                      const meta = column.columnDef.meta as ColumnMeta | undefined;
                      const columnWidth = COLUMN_WIDTHS[column.id] ?? '8rem';

                      if (columnIndex === 0) {
                        return (
                          <TableHead
                            key={`footer-${column.id}`}
                            scope="row"
                            className={getFooterClassName(meta)}
                            style={{ width: columnWidth }}
                          >
                            Total
                          </TableHead>
                        );
                      }

                      return (
                        <TableCell
                          key={`footer-${column.id}`}
                          className={getFooterClassName(meta)}
                          style={{ width: columnWidth }}
                          aria-label={column.id === 'bags' ? 'column total' : undefined}
                        >
                          {column.id === 'bags' ? (
                            <span className="text-foreground font-semibold tabular-nums">
                              {formatQuantity(totalBags)}
                            </span>
                          ) : null}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
