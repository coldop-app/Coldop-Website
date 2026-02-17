import { useMemo, useState } from 'react';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { DaybookEntry } from '@/services/store-admin/functions/useGetDaybook';
import { cn } from '@/lib/utils';
import {
  FarmerStockBreakdownDialog,
  type CellClickData,
  type StockTabMode,
} from '@/components/people/farmer-profile/farmer-stock-breakdown-dialog';

export type {
  BreakdownEntry,
  CellClickData,
  StockTabMode,
} from '@/components/people/farmer-profile/farmer-stock-breakdown-dialog';

/** Aggregate per variety per size: initial and current from RECEIPT (incoming) gate passes. Outgoing = initial - current. */
function aggregateStockByVarietyAndSize(
  incomingEntries: DaybookEntry[],
  sizes: string[]
): {
  varieties: string[];
  byVariety: Map<
    string,
    { initial: Record<string, number>; current: Record<string, number> }
  >;
} {
  const byVariety = new Map<
    string,
    { initial: Record<string, number>; current: Record<string, number> }
  >();
  const varietySet = new Set<string>();

  for (const entry of incomingEntries) {
    if (entry.type !== 'RECEIPT' || !entry.bagSizes?.length) continue;
    const variety = entry.variety ?? 'Unknown';
    varietySet.add(variety);
    let row = byVariety.get(variety);
    if (!row) {
      row = {
        initial: Object.fromEntries(sizes.map((s) => [s, 0])),
        current: Object.fromEntries(sizes.map((s) => [s, 0])),
      };
      byVariety.set(variety, row);
    }
    for (const bag of entry.bagSizes) {
      const size = bag.name;
      if (!row.initial[size]) row.initial[size] = 0;
      if (!row.current[size]) row.current[size] = 0;
      row.initial[size] += bag.initialQuantity ?? 0;
      row.current[size] += bag.currentQuantity ?? 0;
    }
  }

  const varieties = Array.from(varietySet).sort();
  return { varieties, byVariety };
}

export interface FarmerStockSummaryTableProps {
  /** Size column headers in preference order (e.g. from store preferences.commodities[0].sizes) */
  sizes: string[];
  /** Incoming (RECEIPT) gate pass entries to aggregate */
  incomingEntries: DaybookEntry[];
}

interface TableRowData {
  variety: string;
  values: Record<string, number>;
  total: number;
}

const TAB_CONFIG: { id: StockTabMode; label: string }[] = [
  { id: 'current', label: 'Current' },
  { id: 'initial', label: 'Initial' },
  { id: 'outgoing', label: 'Outgoing' },
];

const cellClickClass =
  'font-custom border-border border px-4 py-2 cursor-pointer hover:bg-muted hover:ring-1 hover:ring-primary/20 transition-all duration-150';

export function FarmerStockSummaryTable({
  sizes,
  incomingEntries,
}: FarmerStockSummaryTableProps) {
  const [activeTab, setActiveTab] = useState<StockTabMode>('current');
  const [cellClickData, setCellClickData] = useState<CellClickData | null>(
    null
  );

  const { varieties, byVariety } = useMemo(
    () => aggregateStockByVarietyAndSize(incomingEntries, sizes),
    [incomingEntries, sizes]
  );

  const { rows, totals, tabTotals } = useMemo(() => {
    const rowsData: TableRowData[] = [];
    const totals: Record<string, number> = {};
    const tabTotals: Record<StockTabMode, number> = {
      current: 0,
      initial: 0,
      outgoing: 0,
    };

    for (const size of sizes) {
      totals[size] = 0;
    }

    for (const variety of varieties) {
      const row = byVariety.get(variety);
      if (!row) continue;
      const values: Record<string, number> = {};
      let rowTotal = 0;
      for (const size of sizes) {
        const initial = row.initial[size] ?? 0;
        const current = row.current[size] ?? 0;
        const outgoing = Math.max(0, initial - current);
        values[size] =
          activeTab === 'current'
            ? current
            : activeTab === 'initial'
              ? initial
              : outgoing;
        rowTotal += values[size];
        totals[size] = (totals[size] ?? 0) + values[size];
        tabTotals.current += current;
        tabTotals.initial += initial;
        tabTotals.outgoing += outgoing;
      }
      rowsData.push({ variety, values, total: rowTotal });
    }

    return {
      rows: rowsData,
      totals,
      tabTotals,
    };
  }, [varieties, byVariety, sizes, activeTab]);

  const columns = useMemo<ColumnDef<TableRowData>[]>(() => {
    const cols: ColumnDef<TableRowData>[] = [
      {
        accessorKey: 'variety',
        header: () => <span className="font-custom font-bold">Varieties</span>,
        cell: ({ getValue }) => (
          <span className="font-custom font-medium">
            {getValue() as string}
          </span>
        ),
      },
    ];
    for (const size of sizes) {
      cols.push({
        id: size,
        accessorFn: (row) => row.values[size] ?? 0,
        header: () => <span className="font-custom font-bold">{size}</span>,
        cell: ({ getValue }) => (
          <span className="font-custom font-medium tabular-nums">
            {Number(getValue()).toLocaleString('en-IN')}
          </span>
        ),
      });
    }
    cols.push({
      accessorKey: 'total',
      header: () => <span className="font-custom font-bold">Total</span>,
      cell: ({ getValue }) => (
        <span className="font-custom text-primary font-bold tabular-nums">
          {Number(getValue()).toLocaleString('en-IN')}
        </span>
      ),
    });
    return cols;
  }, [sizes]);

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const totalForActiveTab =
    activeTab === 'current'
      ? tabTotals.current
      : activeTab === 'initial'
        ? tabTotals.initial
        : tabTotals.outgoing;

  const handleCellClick = (
    variety: string,
    column: string,
    value: number,
    rowIndex: number,
    isTotal: boolean
  ) => {
    setCellClickData({ variety, column, value, rowIndex, isTotal });
  };

  const getTitle = (): string => {
    if (!cellClickData) return '';
    const { variety, column, isTotal } = cellClickData;
    if (isTotal && column === 'variety')
      return 'All Varieties - Total Breakdown';
    if (isTotal && column !== 'total' && column !== 'variety') {
      return `Size: ${column} - Total Breakdown`;
    }
    if (column === 'variety') return `Variety: ${variety} - Breakdown`;
    if (column === 'total') return `Variety: ${variety} - Total Breakdown`;
    return `Variety: ${variety} - Size: ${column}`;
  };

  if (sizes.length === 0) {
    return (
      <Card className="border-border rounded-xl shadow-sm">
        <CardContent className="p-4 py-8 sm:p-5">
          <p className="font-custom text-muted-foreground text-center text-sm">
            No sizes configured in preferences.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border rounded-xl shadow-sm">
      <CardContent className="flex flex-col gap-4 p-4 sm:p-5">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="font-custom text-xl font-bold tracking-tight sm:text-2xl">
              Stock Summary
            </h2>
            <p className="font-custom text-muted-foreground mt-1 text-sm">
              View stock quantities by current inventory, initial quantities, or
              outgoing quantities.
            </p>
          </div>
          <div className="border-border flex gap-1 border-b">
            {TAB_CONFIG.map(({ id, label }) => {
              const count =
                id === 'current'
                  ? tabTotals.current
                  : id === 'initial'
                    ? tabTotals.initial
                    : tabTotals.outgoing;
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={cn(
                    'font-custom focus-visible:ring-primary border-b-2 px-3 pt-1 pb-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                    isActive
                      ? 'border-primary text-primary'
                      : 'text-muted-foreground hover:text-foreground border-transparent'
                  )}
                >
                  {label} ({count.toLocaleString('en-IN')})
                </button>
              );
            })}
          </div>
        </div>
        <div className="border-border overflow-x-auto rounded-lg border">
          <Table className="border-collapse">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-border bg-muted hover:bg-muted"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="font-custom border-border border px-4 py-2 font-bold"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-border hover:bg-transparent"
                  >
                    {row.getVisibleCells().map((cell) => {
                      const colId = cell.column.id;
                      const value =
                        colId === 'variety'
                          ? 0
                          : colId === 'total'
                            ? row.original.total
                            : (row.original.values[colId] ?? 0);
                      return (
                        <TableCell
                          key={cell.id}
                          className={cellClickClass}
                          onClick={() =>
                            handleCellClick(
                              row.original.variety,
                              colId,
                              value,
                              row.index,
                              false
                            )
                          }
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-border hover:bg-transparent">
                  <TableCell
                    colSpan={columns.length}
                    className="font-custom text-muted-foreground border-border h-24 border px-4 py-2 text-center"
                  >
                    No stock data.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            {rows.length > 0 && (
              <TableFooter>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead
                    className={cn(
                      'font-custom bg-muted/50 border-border border px-4 py-2 font-bold',
                      cellClickClass
                    )}
                    onClick={() =>
                      handleCellClick('Total', 'variety', 0, -1, true)
                    }
                  >
                    Bag Total
                  </TableHead>
                  {sizes.map((size) => (
                    <TableCell
                      key={size}
                      className={cn(
                        'font-custom bg-muted/50 border-border border px-4 py-2 font-bold',
                        cellClickClass
                      )}
                      onClick={() =>
                        handleCellClick(
                          'Total',
                          size,
                          totals[size] ?? 0,
                          -1,
                          true
                        )
                      }
                    >
                      {(totals[size] ?? 0).toLocaleString('en-IN')}
                    </TableCell>
                  ))}
                  <TableCell
                    className={cn(
                      'font-custom text-primary bg-primary/10 border-border border px-4 py-2 font-bold',
                      cellClickClass
                    )}
                    onClick={() =>
                      handleCellClick(
                        'Total',
                        'total',
                        totalForActiveTab,
                        -1,
                        true
                      )
                    }
                  >
                    {totalForActiveTab.toLocaleString('en-IN')}
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
        <FarmerStockBreakdownDialog
          cellClickData={cellClickData}
          onClose={() => setCellClickData(null)}
          incomingEntries={incomingEntries}
          tabType={activeTab}
          getTitle={getTitle}
        />
      </CardContent>
    </Card>
  );
}
