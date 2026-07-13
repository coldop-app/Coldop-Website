import {
  type ReactNode,
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnOrderState,
  type ExpandedState,
  type GroupingState,
  type PaginationState,
  type SortingState,
  type Table as TanStackTable,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getExpandedRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { IncomingGatePassReportRecord } from '@/features/incoming-report/api/types';
import {
  getIncomingReportColumnIds,
  getStoredIncomingReportColumnState,
} from '@/features/incoming-report/utils/report-column-preferences';
import {
  advancedReportGlobalFilterFn,
  type AdvancedReportGlobalFilter,
  selectedValuesFilterFn,
} from '@/features/incoming-report/utils/report-filter-fns';
import {
  createIncomingReportSearchIndex,
  filterIncomingReportSearchIndex,
} from '@/features/incoming-report/utils/report-search';
import {
  getIncomingReportColumnWidth,
  getIncomingReportTableMinWidth,
} from '@/features/incoming-report/utils/report-column-layout';
import { cn } from '@/lib/utils';

import { incomingReportSortingFns, type IncomingQuantityMode } from './columns';
import {
  getIncomingReportFooterContent,
  ReportTotalLabel,
  incomingReportFooterCellClassName,
} from './report-totals-footer';

const coreRowModel = getCoreRowModel();
const filteredRowModel = getFilteredRowModel();
const groupedRowModel = getGroupedRowModel();
const expandedRowModel = getExpandedRowModel();
const sortedRowModel = getSortedRowModel();
const paginationRowModel = getPaginationRowModel();

const defaultTableColumn: Partial<ColumnDef<IncomingGatePassReportRecord, unknown>> = {
  filterFn: selectedValuesFilterFn,
};

const tableFilterFns = {
  selectedValues: selectedValuesFilterFn,
} as const;

type PaginationItemValue = number | 'ellipsis';

function getPaginationItems(pageIndex: number, pageCount: number): PaginationItemValue[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index);
  }

  const visiblePages = Array.from(
    new Set([0, pageIndex - 1, pageIndex, pageIndex + 1, pageCount - 1]),
  )
    .filter((page) => page >= 0 && page < pageCount)
    .sort((a, b) => a - b);

  return visiblePages.reduce<PaginationItemValue[]>((items, page) => {
    const previousPage = items[items.length - 1];

    if (typeof previousPage === 'number') {
      if (page - previousPage === 2) {
        items.push(previousPage + 1);
      } else if (page - previousPage > 2) {
        items.push('ellipsis');
      }
    }

    items.push(page);
    return items;
  }, []);
}

const TABLE_GRID_CLASS = cn(
  'border-collapse',
  '[&_th]:border-b [&_th]:border-r [&_td]:border-b [&_td]:border-r',
  '[&_th]:border-border/50 [&_td]:border-border/35',
  '[&_th:first-child]:border-l [&_td:first-child]:border-l',
  '[&_thead_th]:border-t [&_thead_th]:border-b-2 [&_thead_th]:border-b-border/60',
  '[&_th:last-child]:border-r-0 [&_td:last-child]:border-r-0',
);

type ColumnMeta = {
  align?: 'left' | 'right';
  columnWidth?: string;
  emphasize?: boolean;
  filterLabel?: string;
  filterValueFormatter?: (value: unknown) => string;
  groupStart?: boolean;
  mono?: boolean;
  numeric?: boolean;
  wrap?: boolean;
};

function resolveColumnWidth(columnId: string, meta: ColumnMeta | undefined): string {
  return meta?.columnWidth ?? getIncomingReportColumnWidth(columnId);
}

const FIXED_CELL_CLASS = cn(
  'max-w-0 min-w-0 !whitespace-normal break-words [overflow-wrap:anywhere]',
);

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

function formatDisplayValue(value: unknown, meta: ColumnMeta | undefined) {
  if (value == null || value === '') return 'Blank';

  return meta?.filterValueFormatter?.(value) ?? String(value);
}

function getHeadClassName(meta: ColumnMeta | undefined, isHeaderScrolled: boolean) {
  const align = getColumnAlign(meta);

  return cn(
    FIXED_CELL_CLASS,
    'h-11 px-3 py-2 align-middle text-sm font-semibold transition-[background-color,color] duration-200',
    isHeaderScrolled
      ? 'bg-muted/60 text-foreground backdrop-blur-sm supports-[backdrop-filter]:bg-muted/55'
      : 'bg-secondary text-secondary-foreground',
    meta?.groupStart === true && 'border-l-2 border-l-border/70',
    meta?.numeric === true && 'tabular-nums',
    align === 'right' && 'text-right',
  );
}

function getCellClassName(meta: ColumnMeta | undefined) {
  const align = getColumnAlign(meta);

  return cn(
    FIXED_CELL_CLASS,
    'px-3 py-3 align-top text-sm leading-relaxed text-foreground',
    meta?.groupStart === true && 'border-l-2 border-l-border/55',
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
    incomingReportFooterCellClassName,
    meta?.groupStart === true && 'border-l-2 border-l-border/55',
    meta?.numeric === true && 'tabular-nums',
    align === 'right' && 'text-right',
  );
}

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  sorted: false | 'asc' | 'desc';
  align: 'left' | 'right';
  children: ReactNode;
}

function DataTableColumnHeader<TData, TValue>({
  column,
  sorted,
  align,
  children,
}: DataTableColumnHeaderProps<TData, TValue>) {
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

interface DataTableProps {
  columns: ColumnDef<IncomingGatePassReportRecord, unknown>[];
  data: IncomingGatePassReportRecord[];
  quantityMode: IncomingQuantityMode;
  quickSearch?: string;
  onTableReady?: (table: TanStackTable<IncomingGatePassReportRecord>) => void;
}

export const DataTable = memo(function DataTable({
  columns,
  data,
  quantityMode,
  quickSearch = '',
  onTableReady,
}: DataTableProps) {
  const deferredQuickSearch = useDeferredValue(quickSearch);
  const searchIndex = useMemo(() => createIncomingReportSearchIndex(data), [data]);
  const filteredData = useMemo(
    () => filterIncomingReportSearchIndex(searchIndex, deferredQuickSearch),
    [deferredQuickSearch, searchIndex],
  );
  const tableData = useMemo(() => [...filteredData], [filteredData, quantityMode]);
  const onTableReadyRef = useRef(onTableReady);

  onTableReadyRef.current = onTableReady;
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => {
    const columnIds = getIncomingReportColumnIds(columns as ColumnDef<unknown, unknown>[]);
    return getStoredIncomingReportColumnState(columnIds).columnVisibility;
  });
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(() => {
    const columnIds = getIncomingReportColumnIds(columns as ColumnDef<unknown, unknown>[]);
    return getStoredIncomingReportColumnState(columnIds).columnOrder;
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [grouping, setGrouping] = useState<GroupingState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [globalFilter, setGlobalFilter] = useState<AdvancedReportGlobalFilter>({
    logic: 'AND',
    conditions: [],
  });
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 100,
  });
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [isFooterElevated, setIsFooterElevated] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable<IncomingGatePassReportRecord>({
    data: tableData,
    columns,
    defaultColumn: defaultTableColumn,
    filterFns: tableFilterFns,
    globalFilterFn: advancedReportGlobalFilterFn,
    getCoreRowModel: coreRowModel,
    getFilteredRowModel: filteredRowModel,
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getGroupedRowModel: groupedRowModel,
    getExpandedRowModel: expandedRowModel,
    getSortedRowModel: sortedRowModel,
    getPaginationRowModel: paginationRowModel,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onGroupingChange: setGrouping,
    onExpandedChange: setExpanded,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    sortingFns: incomingReportSortingFns,
    sortDescFirst: false,
    enableSortingRemoval: true,
    paginateExpandedRows: false,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      columnOrder,
      grouping,
      expanded,
      globalFilter,
      pagination,
    },
    autoResetPageIndex: false,
  });
  const rows = table.getRowModel().rows;
  const footerRows = table.getFilteredRowModel().rows;
  const visibleLeafColumns = table.getVisibleLeafColumns();
  const visibleColumnIds = useMemo(
    () => visibleLeafColumns.map((column) => column.id),
    [visibleLeafColumns],
  );
  const tableMinWidth = useMemo(
    () => getIncomingReportTableMinWidth(visibleColumnIds),
    [visibleColumnIds],
  );
  const footerContentsByColumnId = useMemo(() => {
    const contents = new Map<string, ReactNode>();

    visibleLeafColumns.forEach((column, columnIndex) => {
      contents.set(
        column.id,
        columnIndex === 0 ? (
          <ReportTotalLabel />
        ) : (
          getIncomingReportFooterContent(column.id, footerRows, quantityMode)
        ),
      );
    });

    return contents;
  }, [footerRows, quantityMode, visibleLeafColumns]);
  const totalRowCount = footerRows.length;
  const { pageIndex, pageSize } = pagination;
  const pageCount = Math.max(Math.ceil(totalRowCount / pageSize), 1);
  const canPreviousPage = pageIndex > 0;
  const canNextPage = pageIndex < pageCount - 1;
  const pageItems = useMemo(() => getPaginationItems(pageIndex, pageCount), [pageCount, pageIndex]);
  const rangeStart = totalRowCount === 0 ? 0 : Math.min(pageIndex * pageSize + 1, totalRowCount);
  const rangeEnd = totalRowCount === 0 ? 0 : Math.min((pageIndex + 1) * pageSize, totalRowCount);
  const hasDataRows = rows.length > 0;

  const handleTableScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    setIsHeaderScrolled(el.scrollTop > 0);
    setIsFooterElevated(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
  }, []);

  useEffect(() => {
    handleTableScroll();
  }, [handleTableScroll, rows.length]);

  useEffect(() => {
    setPagination((current) => (current.pageIndex === 0 ? current : { ...current, pageIndex: 0 }));
  }, [deferredQuickSearch]);

  useEffect(() => {
    onTableReadyRef.current?.(table);
  }, [table]);

  useEffect(() => {
    if (pagination.pageIndex < pageCount) return;

    setPagination((current) => ({
      ...current,
      pageIndex: Math.max(pageCount - 1, 0),
    }));
  }, [pageCount, pagination.pageIndex]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    el.scrollTo({ left: el.scrollLeft, top: 0 });
  }, [pageIndex]);

  return (
    <div className="min-w-0 overflow-hidden">
      <div
        ref={scrollContainerRef}
        onScroll={handleTableScroll}
        className="max-h-[min(70vh,42rem)] overflow-auto **:data-[slot=table-container]:overflow-visible"
      >
        <Table className={cn(TABLE_GRID_CLASS, 'table-fixed')} style={{ minWidth: tableMinWidth }}>
          <colgroup>
            {visibleLeafColumns.map((column) => (
              <col
                key={column.id}
                style={{
                  width: resolveColumnWidth(column.id, column.columnDef.meta),
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
                  const meta = header.column.columnDef.meta;
                  const align = getColumnAlign(meta);
                  const sorted = header.column.getIsSorted();
                  const columnWidth = resolveColumnWidth(header.column.id, meta);

                  return (
                    <TableHead
                      key={header.id}
                      className={cn('group/head', getHeadClassName(meta, isHeaderScrolled))}
                      style={{ width: columnWidth }}
                      aria-sort={
                        sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none'
                      }
                    >
                      {header.isPlaceholder ? null : (
                        <DataTableColumnHeader column={header.column} sorted={sorted} align={align}>
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
              rows.map((row) => {
                const isGroupedRow = row.getIsGrouped();

                return (
                  <TableRow
                    key={row.id}
                    className={cn(
                      'even:bg-muted/20 hover:bg-muted/40 border-0',
                      isGroupedRow &&
                        'bg-primary/5 even:bg-primary/5 hover:bg-primary/10 [&>td]:border-b-border/60 [&>td]:border-t-border/60 [&>td]:shadow-[inset_0_1px_0_hsl(var(--primary)/0.12)]',
                    )}
                    data-state={row.getIsSelected() ? 'selected' : undefined}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const meta = cell.column.columnDef.meta;
                      const columnWidth = resolveColumnWidth(cell.column.id, meta);
                      const isGroupedCell = cell.getIsGrouped();
                      const isAggregatedCell = cell.getIsAggregated();
                      const isPlaceholderCell = cell.getIsPlaceholder();

                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(getCellClassName(meta), isGroupedRow && 'bg-transparent')}
                          style={{ width: columnWidth }}
                        >
                          {isGroupedCell ? (
                            <button
                              type="button"
                              className="text-foreground hover:text-primary focus-visible:ring-ring/30 flex min-w-0 items-center gap-2 rounded-md text-left text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
                              style={{ paddingLeft: `${row.depth * 0.75}rem` }}
                              onClick={row.getToggleExpandedHandler()}
                              aria-expanded={row.getIsExpanded()}
                            >
                              {row.getCanExpand() ? (
                                row.getIsExpanded() ? (
                                  <ChevronDown
                                    className="text-primary size-4 shrink-0"
                                    aria-hidden
                                  />
                                ) : (
                                  <ChevronRight
                                    className="text-primary size-4 shrink-0"
                                    aria-hidden
                                  />
                                )
                              ) : null}
                              <span className="min-w-0 break-words">
                                {formatDisplayValue(cell.getValue(), meta)}
                              </span>
                              <span className="bg-primary/10 text-primary shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums">
                                {row.subRows.length.toLocaleString('en-IN')}
                              </span>
                            </button>
                          ) : isAggregatedCell ? (
                            meta?.numeric === true && cell.getValue() != null ? (
                              <span className="text-foreground font-semibold">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </span>
                            ) : (
                              <span aria-hidden />
                            )
                          ) : isPlaceholderCell ? null : (
                            flexRender(cell.column.columnDef.cell, cell.getContext())
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            ) : (
              <TableRow className="border-0">
                <TableCell
                  colSpan={columns.length}
                  className="text-muted-foreground h-32 text-center text-sm"
                >
                  No incoming gate passes found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          {hasDataRows ? (
            <TableFooter
              className={cn(
                'sticky bottom-0 z-10 border-0 bg-transparent [&>tr]:border-0',
                isFooterElevated && 'shadow-border/80 shadow-[0_-1px_0_0]',
              )}
            >
              <TableRow className="border-0 hover:bg-transparent">
                {visibleLeafColumns.map((column, columnIndex) => {
                  const meta = column.columnDef.meta;
                  const footerContent = footerContentsByColumnId.get(column.id);
                  const columnWidth = resolveColumnWidth(column.id, meta);

                  if (columnIndex === 0) {
                    return (
                      <TableHead
                        key={`footer-${column.id}`}
                        scope="row"
                        className={getFooterClassName(meta)}
                        style={{ width: columnWidth }}
                      >
                        {footerContent}
                      </TableHead>
                    );
                  }

                  return (
                    <TableCell
                      key={`footer-${column.id}`}
                      className={getFooterClassName(meta)}
                      style={{ width: columnWidth }}
                      aria-label={footerContent ? 'column total' : undefined}
                    >
                      {footerContent}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableFooter>
          ) : null}
        </Table>
      </div>
      {hasDataRows ? (
        <div className="border-border/60 bg-muted/20 flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <p className="text-muted-foreground text-sm">
            Showing{' '}
            <span className="text-foreground font-medium tabular-nums">
              {rangeStart.toLocaleString('en-IN')}–{rangeEnd.toLocaleString('en-IN')}
            </span>{' '}
            of{' '}
            <span className="text-foreground font-medium tabular-nums">
              {totalRowCount.toLocaleString('en-IN')}
            </span>{' '}
            visible rows
            <span className="hidden sm:inline"> · {pageSize.toLocaleString('en-IN')} per page</span>
          </p>
          <Pagination className="mx-0 w-auto justify-start sm:justify-end">
            <PaginationContent className="flex-wrap justify-start sm:justify-end">
              <PaginationItem className="hidden sm:list-item">
                <PaginationLink
                  href="#"
                  aria-label="Go to first page"
                  aria-disabled={!canPreviousPage}
                  tabIndex={canPreviousPage ? undefined : -1}
                  className={cn('size-9', !canPreviousPage && 'pointer-events-none opacity-50')}
                  onClick={(event) => {
                    event.preventDefault();
                    table.setPagination((current) => ({
                      ...current,
                      pageIndex: 0,
                    }));
                  }}
                >
                  <ChevronsLeft className="size-4" aria-hidden />
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  text="Prev"
                  aria-disabled={!canPreviousPage}
                  tabIndex={canPreviousPage ? undefined : -1}
                  className={cn(!canPreviousPage && 'pointer-events-none opacity-50')}
                  onClick={(event) => {
                    event.preventDefault();
                    table.setPagination((current) => ({
                      ...current,
                      pageIndex: Math.max(current.pageIndex - 1, 0),
                    }));
                  }}
                />
              </PaginationItem>
              {pageItems.map((item, itemIndex) =>
                typeof item === 'number' ? (
                  <PaginationItem
                    key={`incoming-report-page-${item}`}
                    className="hidden sm:list-item"
                  >
                    <PaginationLink
                      href="#"
                      isActive={item === pageIndex}
                      onClick={(event) => {
                        event.preventDefault();
                        table.setPagination((current) => ({
                          ...current,
                          pageIndex: item,
                        }));
                      }}
                    >
                      {item + 1}
                    </PaginationLink>
                  </PaginationItem>
                ) : (
                  <PaginationItem
                    key={`incoming-report-${item}-${itemIndex}`}
                    className="hidden sm:list-item"
                  >
                    <PaginationEllipsis />
                  </PaginationItem>
                ),
              )}
              <PaginationItem className="sm:hidden">
                <span
                  className="text-foreground flex h-10 min-w-16 items-center justify-center rounded-md px-2 text-sm font-medium tabular-nums"
                  aria-live="polite"
                >
                  {pageIndex + 1} / {pageCount}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  aria-disabled={!canNextPage}
                  tabIndex={canNextPage ? undefined : -1}
                  className={cn(!canNextPage && 'pointer-events-none opacity-50')}
                  onClick={(event) => {
                    event.preventDefault();
                    table.setPagination((current) => ({
                      ...current,
                      pageIndex: Math.min(current.pageIndex + 1, pageCount - 1),
                    }));
                  }}
                />
              </PaginationItem>
              <PaginationItem className="hidden sm:list-item">
                <PaginationLink
                  href="#"
                  aria-label="Go to last page"
                  aria-disabled={!canNextPage}
                  tabIndex={canNextPage ? undefined : -1}
                  className={cn('size-9', !canNextPage && 'pointer-events-none opacity-50')}
                  onClick={(event) => {
                    event.preventDefault();
                    table.setPagination((current) => ({
                      ...current,
                      pageIndex: pageCount - 1,
                    }));
                  }}
                >
                  <ChevronsRight className="size-4" aria-hidden />
                </PaginationLink>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      ) : null}
    </div>
  );
});
