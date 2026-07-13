import * as React from 'react';
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

import { ledgerSortingFns } from './columns';
import { DataTableColumnHeader } from './data-table-column-header';
import { DataTablePagination } from './data-table-pagination';
import {
  getCellClassName,
  getColumnAlign,
  getHeadClassName,
  TABLE_GRID_CLASS,
} from './table-styles';
import type { Ledger } from './types';

interface DataTableProps {
  columns: ColumnDef<Ledger>[];
  data: Ledger[];
}

export function DataTable({ columns, data }: DataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([{ id: 'name', desc: false }]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [isHeaderScrolled, setIsHeaderScrolled] = React.useState(false);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }, [data]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    sortingFns: ledgerSortingFns,
    enableSortingRemoval: true,
    sortDescFirst: false,
    autoResetPageIndex: false,
  });

  const rows = table.getRowModel().rows;
  const totalRowCount = table.getRowModel().rows.length;
  const { pageIndex, pageSize } = pagination;
  const pageCount = Math.max(Math.ceil(totalRowCount / pageSize), 1);
  const hasDataRows = rows.length > 0;

  const handleTableScroll = React.useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    setIsHeaderScrolled(el.scrollTop > 0);
  }, []);

  React.useEffect(() => {
    handleTableScroll();
  }, [handleTableScroll, rows.length]);

  React.useEffect(() => {
    if (pagination.pageIndex < pageCount) return;

    setPagination((current) => ({
      ...current,
      pageIndex: Math.max(pageCount - 1, 0),
    }));
  }, [pageCount, pagination.pageIndex]);

  React.useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    el.scrollTo({ left: el.scrollLeft, top: 0 });
  }, [pageIndex]);

  const handlePageChange = (nextPageIndex: number) => {
    setPagination((current) => ({ ...current, pageIndex: nextPageIndex }));
  };

  const handlePageSizeChange = (nextPageSize: number) => {
    setPagination({ pageIndex: 0, pageSize: nextPageSize });
  };

  return (
    <div className="border-border min-w-0 overflow-hidden rounded-lg border">
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
              rows.map((row) => (
                <TableRow key={row.id} className="even:bg-muted/20 hover:bg-muted/40 border-0">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={getCellClassName(cell.column.columnDef.meta)}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="border-0">
                <TableCell
                  colSpan={columns.length}
                  className="text-muted-foreground h-32 text-center text-sm"
                >
                  No ledgers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {hasDataRows ? (
        <DataTablePagination
          pageIndex={pageIndex}
          pageSize={pageSize}
          totalRows={totalRowCount}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      ) : null}
    </div>
  );
}
