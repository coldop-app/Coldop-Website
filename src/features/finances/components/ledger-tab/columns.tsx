/* eslint-disable react-refresh/only-export-components */
import type { ColumnDef, SortingFn } from '@tanstack/react-table';
import { Link } from '@tanstack/react-router';
import { Pencil, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { FinancesPeriod } from '@/features/finances/search';
import { DEFAULT_FINANCES_PERIOD } from '@/features/finances/shared/constants';
import { cn } from '@/lib/utils';

import type { Ledger } from './types';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
});

function formatBalance(amount: number) {
  return currencyFormatter.format(amount);
}

function BalanceCell({ amount }: { amount: number }) {
  return (
    <span
      className={cn('tabular-nums', amount < 0 && 'text-destructive')}
      title={formatBalance(amount)}
    >
      {formatBalance(amount)}
    </span>
  );
}

function ClosingBalanceCell({ amount }: { amount: number | null }) {
  if (amount === null) {
    return <span className="text-muted-foreground">—</span>;
  }

  return <BalanceCell amount={amount} />;
}

const ledgerNumericSortingFn: SortingFn<Ledger> = (rowA, rowB, columnId) => {
  const a = Number(rowA.getValue(columnId));
  const b = Number(rowB.getValue(columnId));

  if (!Number.isFinite(a) && !Number.isFinite(b)) return 0;
  if (!Number.isFinite(a)) return -1;
  if (!Number.isFinite(b)) return 1;

  return a === b ? 0 : a > b ? 1 : -1;
};

export const ledgerSortingFns = {
  ledgerNumeric: ledgerNumericSortingFn,
};

export function createLedgerColumns(options?: {
  period?: FinancesPeriod;
  onEdit?: (ledger: Ledger) => void;
  onDelete?: (ledger: Ledger) => void;
}): ColumnDef<Ledger>[] {
  const period = options?.period ?? DEFAULT_FINANCES_PERIOD;
  const onEdit = options?.onEdit;
  const onDelete = options?.onDelete;

  return [
    {
      accessorKey: 'name',
      header: 'Name',
      meta: { wrap: true },
      cell: ({ row }) => (
        <Link
          to="/finances/ledgers/$id"
          params={{ id: row.original.id }}
          search={{ period }}
          className="text-primary font-medium hover:underline"
          title={row.getValue('name')}
        >
          {row.getValue('name')}
        </Link>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => <span>{row.getValue('type')}</span>,
    },
    {
      accessorKey: 'subType',
      header: 'SubType',
      meta: { wrap: true },
      cell: ({ row }) => <span title={row.getValue('subType')}>{row.getValue('subType')}</span>,
    },
    {
      accessorKey: 'category',
      header: 'Category',
      meta: { compact: true },
      cell: ({ row }) => (
        <span className="block truncate" title={row.getValue('category')}>
          {row.getValue('category')}
        </span>
      ),
    },
    {
      accessorKey: 'openingBalance',
      header: 'Opening Balance',
      meta: { align: 'right', numeric: true },
      sortingFn: ledgerNumericSortingFn,
      cell: ({ row }) => <BalanceCell amount={parseFloat(row.getValue('openingBalance'))} />,
    },
    {
      accessorKey: 'balance',
      header: 'Balance',
      meta: { align: 'right', numeric: true },
      sortingFn: ledgerNumericSortingFn,
      cell: ({ row }) => <BalanceCell amount={parseFloat(row.getValue('balance'))} />,
    },
    {
      accessorKey: 'closingBalance',
      header: 'Closing Balance',
      meta: { align: 'right', numeric: true },
      sortingFn: ledgerNumericSortingFn,
      cell: ({ row }) => <ClosingBalanceCell amount={row.original.closingBalance} />,
    },
    {
      accessorKey: 'kind',
      header: 'Kind',
      cell: ({ row }) => {
        const kind = row.getValue('kind') as Ledger['kind'];

        if (kind === 'System') {
          return (
            <Badge variant="secondary" className="font-normal">
              System
            </Badge>
          );
        }

        return <span className="text-muted-foreground">Custom</span>;
      },
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const ledger = row.original;
        const isSystemLedger = ledger.kind === 'System';

        return (
          <div className="flex items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9"
              aria-label={`Edit ledger ${ledger.name}`}
              disabled={isSystemLedger}
              onClick={() => onEdit?.(ledger)}
            >
              <Pencil className="size-4" aria-hidden />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive size-9"
              aria-label={`Delete ledger ${ledger.name}`}
              disabled={isSystemLedger}
              onClick={() => onDelete?.(ledger)}
            >
              <Trash2 className="size-4" aria-hidden />
            </Button>
          </div>
        );
      },
    },
  ];
}

export const columns = createLedgerColumns();
