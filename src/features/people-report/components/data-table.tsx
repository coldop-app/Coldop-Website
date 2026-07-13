import * as React from 'react';
import {
  type Cell,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnOrderState,
  type ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getGroupedRowModel,
  getSortedRowModel,
  type GroupingState,
  type OnChangeFn,
  type Row,
  type SortingState,
  type Table as TanStackTable,
  type VisibilityState,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronRight } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type {
  FarmerReportSectionMode,
  FarmerReportTableRow,
} from '@/features/people-report/utils/build-farmer-report-sections';
import {
  applyRunningTotalsInDisplayOrder,
  getFarmerReportSectionStartingBalance,
} from '@/features/people-report/utils/build-farmer-report-sections';
import { getStoredFarmerReportColumnState } from '@/features/people-report/utils/report-column-preferences';
import { getOrderedRowsForRunningTotals } from '@/features/people-report/utils/report-display-order';
import {
  advancedReportGlobalFilterFn,
  type AdvancedReportGlobalFilter,
  selectedValuesFilterFn,
} from '@/features/people-report/utils/report-filter-fns';
import { cn } from '@/lib/utils';

import { farmerReportSortingFns } from './columns';
import { DataTableColumnHeader } from './data-table-column-header';
import { ReportTotalsFooter } from './report-totals-footer';
import {
  getCellClassName,
  getColumnAlign,
  getHeadClassName,
  OPENING_BALANCE_ROW_CLASS,
  TABLE_GRID_CLASS,
} from './table-styles';

export const FARMER_REPORT_DEFAULT_SORTING: SortingState = [{ id: 'date', desc: false }];

export type FarmerReportTableMeta = {
  runningTotalByRowKey?: Map<string, number>;
};

export const RunningTotalsContext = React.createContext<Map<string, number>>(new Map());

export type FarmerReportViewState = {
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
  columnOrder: ColumnOrderState;
  grouping: GroupingState;
  globalFilter: AdvancedReportGlobalFilter;
};

export function createDefaultFarmerReportViewState(
  columnIds: string[] = [],
): FarmerReportViewState {
  const stored = getStoredFarmerReportColumnState(columnIds);

  return {
    columnFilters: [],
    columnVisibility: stored.columnVisibility,
    columnOrder: stored.columnOrder,
    grouping: [],
    globalFilter: { logic: 'AND', conditions: [] },
  };
}

const defaultTableColumn: Partial<ColumnDef<FarmerReportTableRow, unknown>> = {
  filterFn: selectedValuesFilterFn,
};

const tableFilterFns = {
  selectedValues: selectedValuesFilterFn,
} as const;

interface DataTableProps {
  columns: ColumnDef<FarmerReportTableRow>[];
  data: FarmerReportTableRow[];
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  viewState: FarmerReportViewState;
  expanded: ExpandedState;
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>;
  onColumnVisibilityChange: OnChangeFn<VisibilityState>;
  onColumnOrderChange: OnChangeFn<ColumnOrderState>;
  onGroupingChange: OnChangeFn<GroupingState>;
  onGlobalFilterChange: OnChangeFn<AdvancedReportGlobalFilter>;
  onExpandedChange: OnChangeFn<ExpandedState>;
  sectionMode?: FarmerReportSectionMode;
  flush?: boolean;
  onTableReady?: (table: TanStackTable<FarmerReportTableRow>) => void;
}

function renderGroupedCell(
  row: Row<FarmerReportTableRow>,
  cell: Cell<FarmerReportTableRow, unknown>,
) {
  const canExpand = row.getCanExpand();

  return (
    <button
      type="button"
      className={cn(
        'text-foreground flex w-full min-w-0 items-center gap-1.5 text-left font-medium',
        canExpand ? 'cursor-pointer' : 'cursor-default',
      )}
      onClick={row.getToggleExpandedHandler()}
      disabled={!canExpand}
    >
      <ChevronRight
        className={cn(
          'text-muted-foreground size-4 shrink-0 transition-transform',
          row.getIsExpanded() && 'rotate-90',
        )}
        aria-hidden
      />
      <span className="min-w-0 flex-1">
        {flexRender(cell.column.columnDef.cell, cell.getContext())}
      </span>
      <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
        ({row.subRows.length})
      </span>
    </button>
  );
}

function renderDataCell(row: Row<FarmerReportTableRow>, cell: Cell<FarmerReportTableRow, unknown>) {
  if (cell.getIsGrouped()) {
    return renderGroupedCell(row, cell);
  }

  if (cell.getIsAggregated()) {
    return flexRender(
      cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell,
      cell.getContext(),
    );
  }

  if (cell.getIsPlaceholder()) {
    return null;
  }

  return flexRender(cell.column.columnDef.cell, cell.getContext());
}

function getTableRowClassName(row: Row<FarmerReportTableRow>) {
  if (row.original.kind === 'opening-balance') {
    return OPENING_BALANCE_ROW_CLASS;
  }

  return cn(
    'border-0',
    row.getIsGrouped()
      ? 'bg-muted/50 font-medium hover:bg-muted/50'
      : 'even:bg-muted/20 hover:bg-muted/40',
  );
}

function renderTableRow(row: Row<FarmerReportTableRow>, isGroupingActive: boolean) {
  return (
    <TableRow key={row.id} className={getTableRowClassName(row)}>
      {row.getVisibleCells().map((cell, cellIndex) => (
        <TableCell
          key={cell.id}
          className={cn(
            getCellClassName(cell.column.columnDef.meta),
            isGroupingActive && row.depth > 0 && 'bg-background/40',
          )}
          style={
            isGroupingActive && row.depth > 0 && cellIndex === 0
              ? { paddingLeft: `${row.depth * 1.25 + 0.75}rem` }
              : undefined
          }
        >
          {renderDataCell(row, cell)}
        </TableCell>
      ))}
    </TableRow>
  );
}

function renderPinnedTableRow(
  row: Row<FarmerReportTableRow>,
  visibleColumns: Column<FarmerReportTableRow, unknown>[],
) {
  const cellsByColumnId = new Map(row.getVisibleCells().map((cell) => [cell.column.id, cell]));

  return (
    <TableRow key={row.id} className={getTableRowClassName(row)}>
      {visibleColumns.map((column, columnIndex) => {
        const cell = cellsByColumnId.get(column.id);

        if (!cell) {
          return <TableCell key={column.id} className={getCellClassName(column.columnDef.meta)} />;
        }

        let content: React.ReactNode;

        if (row.original.kind === 'opening-balance') {
          if (columnIndex === 0) {
            content = <span className="text-primary font-semibold">Opening Balance</span>;
          } else if (column.id === 'date') {
            content = <span className="text-muted-foreground">—</span>;
          } else {
            content = renderDataCell(row, cell);
          }
        } else {
          content = renderDataCell(row, cell);
        }

        return (
          <TableCell key={cell.id} className={getCellClassName(column.columnDef.meta)}>
            {content}
          </TableCell>
        );
      })}
    </TableRow>
  );
}

export function DataTable({
  columns,
  data,
  sorting,
  onSortingChange,
  viewState,
  expanded,
  onColumnFiltersChange,
  onColumnVisibilityChange,
  onColumnOrderChange,
  onGroupingChange,
  onGlobalFilterChange,
  onExpandedChange,
  sectionMode = 'incoming',
  flush = false,
  onTableReady,
}: DataTableProps) {
  const [isHeaderScrolled, setIsHeaderScrolled] = React.useState(false);
  const [isFooterElevated, setIsFooterElevated] = React.useState(false);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const scrollRafRef = React.useRef<number | null>(null);
  const isHeaderScrolledRef = React.useRef(false);
  const isFooterElevatedRef = React.useRef(false);
  const onTableReadyRef = React.useRef(onTableReady);

  onTableReadyRef.current = onTableReady;

  const { grouping } = viewState;
  const isGroupingActive = grouping.length > 0;

  const pinnedRows = React.useMemo(
    () => (isGroupingActive ? data.filter((row) => row.kind === 'opening-balance') : []),
    [data, isGroupingActive],
  );

  const groupableData = React.useMemo(
    () => (isGroupingActive ? data.filter((row) => row.kind !== 'opening-balance') : data),
    [data, isGroupingActive],
  );

  const table = useReactTable({
    data: groupableData,
    columns,
    defaultColumn: defaultTableColumn,
    filterFns: tableFilterFns,
    globalFilterFn: advancedReportGlobalFilterFn,
    state: {
      sorting,
      grouping: viewState.grouping,
      expanded,
      columnFilters: viewState.columnFilters,
      columnVisibility: viewState.columnVisibility,
      columnOrder: viewState.columnOrder,
      globalFilter: viewState.globalFilter,
    },
    onSortingChange,
    onColumnFiltersChange,
    onColumnVisibilityChange,
    onColumnOrderChange,
    onGroupingChange,
    onGlobalFilterChange,
    onExpandedChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getSortedRowModel: getSortedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    sortingFns: farmerReportSortingFns,
    enableSortingRemoval: true,
    sortDescFirst: false,
    groupedColumnMode: 'reorder',
  });

  const pinnedTable = useReactTable({
    data: pinnedRows,
    columns,
    state: {
      columnVisibility: viewState.columnVisibility,
      columnOrder: viewState.columnOrder,
    },
    onColumnVisibilityChange,
    onColumnOrderChange,
    getCoreRowModel: getCoreRowModel(),
  });

  const pinnedTableRows = pinnedTable.getRowModel().rows;
  const rows = table.getRowModel().rows;
  const visibleColumns = table.getVisibleLeafColumns();
  const hasDataRows = pinnedTableRows.length > 0 || rows.length > 0;

  const runningTotalByRowKey = React.useMemo(
    () =>
      applyRunningTotalsInDisplayOrder(
        getOrderedRowsForRunningTotals(
          pinnedTableRows.map((row) => row.original),
          rows,
          isGroupingActive,
        ),
        sectionMode,
        getFarmerReportSectionStartingBalance(data, sectionMode),
      ),
    [data, isGroupingActive, pinnedTableRows, rows, sectionMode],
  );

  const handleTableScroll = React.useCallback(() => {
    if (scrollRafRef.current !== null) return;

    scrollRafRef.current = window.requestAnimationFrame(() => {
      scrollRafRef.current = null;
      const el = scrollContainerRef.current;
      if (!el) return;

      const nextHeaderScrolled = el.scrollTop > 0;
      const hasOverflow = el.scrollHeight > el.clientHeight;
      const isAtBottom = Math.ceil(el.scrollTop + el.clientHeight) >= el.scrollHeight;
      const nextFooterElevated = hasOverflow && !isAtBottom;

      if (nextHeaderScrolled !== isHeaderScrolledRef.current) {
        isHeaderScrolledRef.current = nextHeaderScrolled;
        setIsHeaderScrolled(nextHeaderScrolled);
      }

      if (nextFooterElevated !== isFooterElevatedRef.current) {
        isFooterElevatedRef.current = nextFooterElevated;
        setIsFooterElevated(nextFooterElevated);
      }
    });
  }, []);

  React.useEffect(() => {
    return () => {
      if (scrollRafRef.current !== null) {
        window.cancelAnimationFrame(scrollRafRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    handleTableScroll();
  }, [handleTableScroll, rows.length, columns.length]);

  React.useEffect(() => {
    onTableReadyRef.current?.(table);
  }, [table]);

  return (
    <RunningTotalsContext.Provider value={runningTotalByRowKey}>
      <div
        className={cn(
          'min-w-0 overflow-hidden',
          flush ? 'rounded-none border-0' : 'border-border rounded-lg border',
        )}
      >
        <div
          ref={scrollContainerRef}
          onScroll={handleTableScroll}
          className="max-h-[min(70vh,42rem)] overflow-auto **:data-[slot=table-container]:overflow-visible"
        >
          <Table className={TABLE_GRID_CLASS}>
            <TableHeader
              className={cn(
                'sticky top-0 z-10 [&_tr]:border-0 [&_tr]:hover:bg-transparent',
                isHeaderScrolled && 'shadow-border/80 shadow-[0_1px_0_0]',
              )}
            >
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-0">
                  {headerGroup.headers.map((header) => {
                    const meta = header.column.columnDef.meta;
                    const align = getColumnAlign(meta);
                    const sorted = header.column.getIsSorted();

                    return (
                      <TableHead
                        key={header.id}
                        className={cn('group/head', getHeadClassName(meta, isHeaderScrolled))}
                        aria-sort={
                          sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none'
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
              {hasDataRows ? (
                <>
                  {pinnedTableRows.map((row) => renderPinnedTableRow(row, visibleColumns))}
                  {rows.map((row) => renderTableRow(row, isGroupingActive))}
                </>
              ) : (
                <TableRow className="border-0">
                  <TableCell
                    colSpan={columns.length}
                    className="text-muted-foreground h-32 text-center text-sm"
                  >
                    No gate passes found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

            {hasDataRows ? (
              <ReportTotalsFooter
                table={table}
                rows={data}
                sectionMode={sectionMode}
                isFooterElevated={isFooterElevated}
              />
            ) : null}
          </Table>
        </div>
      </div>
    </RunningTotalsContext.Provider>
  );
}
