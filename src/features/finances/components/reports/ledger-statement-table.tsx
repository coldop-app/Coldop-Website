import { useEffect, useMemo, useState } from 'react';
import {
  type ExpandedState,
  type GroupingState,
  type PaginationState,
  flexRender,
  useTable,
} from '@tanstack/react-table';
import { ChevronRight } from 'lucide-react';

import { ListPaginationFooter } from '@/components/list-pagination-footer';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { isDebitNatureType } from '@/features/finances/domain/ledger-classification';
import type { LedgerStatementEntry, LedgerStatementReport } from '@/features/finances/domain/types';
import { formatCurrency } from '@/features/finances/shared/format-currency';
import {
  type AppCell,
  type AppColumnDef,
  type AppRow,
  appTableFeatures,
} from '@/lib/table/features';
import { cn } from '@/lib/utils';

import {
  formatLedgerStatementDate,
  ledgerStatementBalanceAggregation,
  ledgerStatementCreditAggregation,
  ledgerStatementDebitAggregation,
  ledgerStatementEmptyAggregation,
} from './ledger-statement-aggregations';

const PAGE_SIZE_OPTIONS = [10, 50, 100] as const;
const DEFAULT_PAGE_SIZE = PAGE_SIZE_OPTIONS[0];

type LedgerStatementTableProps = {
  statement: LedgerStatementReport;
  groupByDate?: boolean;
};

function formatAmount(amount: number): string {
  return amount ? formatCurrency(amount) : '';
}

function formatRunningBalance(runningBalance: number, isDebitNature: boolean): string {
  const isDebit = isDebitNature ? runningBalance >= 0 : runningBalance < 0;
  return `${formatCurrency(Math.abs(runningBalance))} ${isDebit ? 'Dr' : 'Cr'}`;
}

function entryNarration(entry: LedgerStatementEntry): string {
  return entry.narration || `${entry.isDebit ? 'To' : 'By'} ${entry.counterpartyName}`;
}

function createLedgerStatementColumns(
  isDebitNature: boolean,
): AppColumnDef<LedgerStatementEntry>[] {
  return [
    {
      id: 'date',
      accessorFn: (entry) => formatLedgerStatementDate(entry.date),
      header: 'Date',
      cell: ({ getValue }) => getValue<string>(),
    },
    {
      id: 'voucherNo',
      accessorKey: 'voucherNo',
      header: 'Voucher No.',
      aggregationFn: ledgerStatementEmptyAggregation,
      aggregatedCell: () => null,
      cell: ({ getValue }) => getValue<string>(),
    },
    {
      id: 'entryType',
      accessorKey: 'entryType',
      header: 'B',
      aggregationFn: ledgerStatementEmptyAggregation,
      aggregatedCell: () => null,
      cell: ({ getValue }) => getValue<string>(),
    },
    {
      id: 'narration',
      accessorFn: (entry) => entryNarration(entry),
      header: 'Narration',
      aggregationFn: ledgerStatementEmptyAggregation,
      aggregatedCell: () => null,
      cell: ({ getValue }) => getValue<string>(),
    },
    {
      id: 'debit',
      accessorFn: (entry) => (entry.isDebit ? entry.amount : 0),
      header: 'Debit',
      aggregationFn: ledgerStatementDebitAggregation,
      maxAggregationDepth: Infinity,
      aggregatedCell: ({ getValue }) => formatAmount(Number(getValue()) || 0),
      cell: ({ row }) => (row.original.isDebit ? formatAmount(row.original.amount) : ''),
    },
    {
      id: 'credit',
      accessorFn: (entry) => (entry.isDebit ? 0 : entry.amount),
      header: 'Credit',
      aggregationFn: ledgerStatementCreditAggregation,
      maxAggregationDepth: Infinity,
      aggregatedCell: ({ getValue }) => formatAmount(Number(getValue()) || 0),
      cell: ({ row }) => (row.original.isDebit ? '' : formatAmount(row.original.amount)),
    },
    {
      id: 'balance',
      accessorKey: 'runningBalance',
      header: 'Balance',
      aggregationFn: ledgerStatementBalanceAggregation,
      maxAggregationDepth: Infinity,
      aggregatedCell: ({ getValue }) =>
        formatRunningBalance(Number(getValue()) || 0, isDebitNature),
      cell: ({ row }) => formatRunningBalance(row.original.runningBalance, isDebitNature),
    },
  ];
}

function renderGroupedDateCell(
  row: AppRow<LedgerStatementEntry>,
  cell: AppCell<LedgerStatementEntry>,
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

function renderDataCell(row: AppRow<LedgerStatementEntry>, cell: AppCell<LedgerStatementEntry>) {
  if (cell.getIsGrouped()) {
    return renderGroupedDateCell(row, cell);
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

function cellClassName(columnId: string): string {
  const numeric = columnId === 'debit' || columnId === 'credit' || columnId === 'balance';
  const centered = columnId === 'entryType';

  return cn(
    'px-3 py-2.5',
    numeric && 'text-right tabular-nums',
    columnId === 'voucherNo' && 'tabular-nums',
    columnId === 'balance' && 'font-medium',
    centered && 'text-center',
  );
}

export function LedgerStatementTable({
  statement,
  groupByDate = false,
}: LedgerStatementTableProps) {
  const { ledger, openingBalance, hasOpeningBalance, entries, hasNoData } = statement;
  const isDebitNature = isDebitNatureType(ledger.type);
  const grouping = useMemo<GroupingState>(() => (groupByDate ? ['date'] : []), [groupByDate]);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const columns = useMemo(() => createLedgerStatementColumns(isDebitNature), [isDebitNature]);

  const effectivePagination = useMemo<PaginationState>(
    () => (groupByDate ? { pageIndex: 0, pageSize: Infinity } : pagination),
    [groupByDate, pagination],
  );

  useEffect(() => {
    setExpanded({});
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }, [groupByDate]);

  useEffect(() => {
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }, [entries]);

  const table = useTable({
    features: appTableFeatures,
    data: entries,
    columns,
    state: { grouping, expanded, pagination: effectivePagination },
    onExpandedChange: setExpanded,
    onGroupingChange: () => undefined,
    onPaginationChange: (updater) => {
      if (groupByDate) return;
      setPagination(updater);
    },
    autoResetPageIndex: false,
    groupedColumnMode: false,
    getRowId: (entry) => entry.id,
    getRowCanExpand: (row) => row.getIsGrouped(),
  });

  const totalRows = entries.length;
  const { pageIndex, pageSize } = pagination;
  const pageCount = Math.max(Math.ceil(totalRows / pageSize), 1);
  const rangeStart = totalRows === 0 ? 0 : Math.min(pageIndex * pageSize + 1, totalRows);
  const rangeEnd = totalRows === 0 ? 0 : Math.min((pageIndex + 1) * pageSize, totalRows);
  const showPagination = !groupByDate && totalRows > 0;
  const showOpeningBalance =
    hasOpeningBalance && (groupByDate || pagination.pageIndex === 0);

  useEffect(() => {
    if (groupByDate) return;
    if (pagination.pageIndex < pageCount) return;

    setPagination((current) => ({
      ...current,
      pageIndex: Math.max(pageCount - 1, 0),
    }));
  }, [groupByDate, pageCount, pagination.pageIndex]);

  const handlePageChange = (nextPageIndex: number) => {
    setPagination((current) => ({ ...current, pageIndex: nextPageIndex }));
  };

  const handlePageSizeChange = (nextPageSize: number) => {
    setPagination({ pageIndex: 0, pageSize: nextPageSize });
  };

  return (
    <div className="border-border relative w-full overflow-hidden rounded-lg border">
      <div className="overflow-auto">
        <Table className="w-full text-sm">
          <TableHeader className="border-border bg-muted/50 border-b">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      'text-muted-foreground h-10 px-3 font-medium',
                      header.column.id === 'entryType' && 'w-10 text-center',
                      (header.column.id === 'debit' ||
                        header.column.id === 'credit' ||
                        header.column.id === 'balance') &&
                        'text-right',
                    )}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {showOpeningBalance ? (
              <TableRow className="border-border hover:bg-muted/50 border-b">
                <TableCell className="px-3 py-2.5">{formatLedgerStatementDate(new Date())}</TableCell>
                <TableCell className="px-3 py-2.5" />
                <TableCell className="px-3 py-2.5 text-center">OB</TableCell>
                <TableCell className="px-3 py-2.5">Opening Balance</TableCell>
                <TableCell className="px-3 py-2.5 text-right tabular-nums">
                  {openingBalance > 0 && isDebitNature ? formatCurrency(openingBalance) : ''}
                </TableCell>
                <TableCell className="px-3 py-2.5 text-right tabular-nums">
                  {openingBalance > 0 && !isDebitNature
                    ? formatCurrency(openingBalance)
                    : openingBalance < 0 && isDebitNature
                      ? formatCurrency(Math.abs(openingBalance))
                      : ''}
                </TableCell>
                <TableCell className="px-3 py-2.5 text-right font-medium tabular-nums">
                  {formatCurrency(Math.abs(openingBalance))} {openingBalance >= 0 ? 'Dr' : 'Cr'}
                </TableCell>
              </TableRow>
            ) : null}

            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className={cn(
                  'border-border border-b',
                  row.getIsGrouped()
                    ? 'bg-muted/50 hover:bg-muted/50 font-medium'
                    : 'hover:bg-muted/50',
                )}
              >
                {row.getVisibleCells().map((cell, cellIndex) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      cellClassName(cell.column.id),
                      groupByDate && row.depth > 0 && 'bg-background/40',
                    )}
                    style={
                      groupByDate && row.depth > 0 && cellIndex === 0
                        ? { paddingLeft: `${row.depth * 1.25 + 0.75}rem` }
                        : undefined
                    }
                  >
                    {renderDataCell(row, cell)}
                  </TableCell>
                ))}
              </TableRow>
            ))}

            {hasNoData ? (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground px-3 py-8 text-center">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      {showPagination ? (
        <ListPaginationFooter
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          totalItems={totalRows}
          itemLabel="entries"
          currentPage={pageIndex + 1}
          totalPages={pageCount}
          pageSize={pageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onPageSizeChange={handlePageSizeChange}
          onPreviousPage={() => handlePageChange(Math.max(pageIndex - 1, 0))}
          onNextPage={() => handlePageChange(Math.min(pageIndex + 1, pageCount - 1))}
          onGoToPage={(page) => handlePageChange(page - 1)}
          isPreviousDisabled={pageIndex <= 0}
          isNextDisabled={pageIndex >= pageCount - 1}
        />
      ) : null}
    </div>
  );
}
