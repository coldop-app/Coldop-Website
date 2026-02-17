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
import type {
  VarietyStockSummary,
  SizeQuantity,
} from '@/services/analytics/useGetStorageSummary';
import { cn } from '@/lib/utils';

type TabMode = 'current' | 'initial' | 'outgoing';

interface TableRowData {
  variety: string;
  values: Record<string, number>;
  total: number;
}

const TAB_CONFIG: { id: TabMode; label: string }[] = [
  { id: 'current', label: 'Current' },
  { id: 'initial', label: 'Initial' },
  { id: 'outgoing', label: 'Outgoing' },
];

export interface StorageSummaryTableProps {
  /** Stock summary by variety and size */
  stockSummary: VarietyStockSummary[];
  /** Size column headers in display order */
  sizes: string[];
  /** When set, table shows only this mode and the tab row is hidden (e.g. when page-level tabs control the mode). */
  controlledTab?: 'current' | 'initial' | 'outgoing';
}

function buildSizeMap(
  sizes: SizeQuantity[]
): Map<string, { initial: number; current: number }> {
  const map = new Map<string, { initial: number; current: number }>();
  for (const s of sizes) {
    map.set(s.size, {
      initial: s.initialQuantity,
      current: s.currentQuantity,
    });
  }
  return map;
}

export function StorageSummaryTable({
  stockSummary,
  sizes,
  controlledTab,
}: StorageSummaryTableProps) {
  const [internalTab, setInternalTab] = useState<TabMode>('current');
  const activeTab = controlledTab ?? internalTab;

  const { rows, totals, tabTotals } = useMemo(() => {
    const rowsData: TableRowData[] = [];
    const totals: Record<string, number> = {};
    const tabTotals: Record<TabMode, number> = {
      current: 0,
      initial: 0,
      outgoing: 0,
    };

    for (const size of sizes) {
      totals[size] = 0;
    }

    for (const varietyRow of stockSummary) {
      const sizeMap = buildSizeMap(varietyRow.sizes);
      const values: Record<string, number> = {};
      let rowTotal = 0;

      for (const size of sizes) {
        const data = sizeMap.get(size) ?? { initial: 0, current: 0 };
        const outgoing = Math.max(0, data.initial - data.current);
        const value =
          activeTab === 'current'
            ? data.current
            : activeTab === 'initial'
              ? data.initial
              : outgoing;
        values[size] = value;
        rowTotal += value;
        totals[size] = (totals[size] ?? 0) + value;
        tabTotals.current += data.current;
        tabTotals.initial += data.initial;
        tabTotals.outgoing += outgoing;
      }
      rowsData.push({ variety: varietyRow.variety, values, total: rowTotal });
    }

    return { rows: rowsData, totals, tabTotals };
  }, [stockSummary, sizes, activeTab]);

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

  if (sizes.length === 0) {
    return (
      <Card className="border-border rounded-xl shadow-sm">
        <CardContent className="p-4 py-8 sm:p-5">
          <p className="font-custom text-muted-foreground text-center text-sm">
            No sizes in stock summary.
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
            {controlledTab == null ? (
              <p className="font-custom text-muted-foreground mt-1 text-sm">
                View stock by current inventory, initial quantities, or outgoing
                quantities.
              </p>
            ) : (
              <p className="font-custom text-muted-foreground mt-1 text-sm">
                Showing {controlledTab} quantities.
              </p>
            )}
          </div>
          {controlledTab == null && (
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
                    onClick={() => setInternalTab(id)}
                    className={cn(
                      'font-custom focus-visible:ring-primary border-b-2 px-3 pt-1 pb-2.5 text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
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
          )}
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
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="font-custom border-border border px-4 py-2"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
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
                  <TableHead className="font-custom bg-muted/50 border-border border px-4 py-2 font-bold">
                    Bag Total
                  </TableHead>
                  {sizes.map((size) => (
                    <TableCell
                      key={size}
                      className="font-custom bg-muted/50 border-border border px-4 py-2 font-bold tabular-nums"
                    >
                      {(totals[size] ?? 0).toLocaleString('en-IN')}
                    </TableCell>
                  ))}
                  <TableCell className="font-custom text-primary bg-primary/10 border-border border px-4 py-2 font-bold tabular-nums">
                    {totalForActiveTab.toLocaleString('en-IN')}
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
