import type { ColumnDef, FilterFn, SortingFn } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

import type { Voucher } from './types';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
});

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return dateFormatter.format(date);
}

const voucherDateSortingFn: SortingFn<Voucher> = (rowA, rowB, columnId) => {
  const a = new Date(String(rowA.getValue(columnId))).getTime();
  const b = new Date(String(rowB.getValue(columnId))).getTime();

  if (Number.isNaN(a) && Number.isNaN(b)) return 0;
  if (Number.isNaN(a)) return -1;
  if (Number.isNaN(b)) return 1;

  return a === b ? 0 : a > b ? 1 : -1;
};

const voucherNumericSortingFn: SortingFn<Voucher> = (rowA, rowB, columnId) => {
  const a = Number(rowA.getValue(columnId));
  const b = Number(rowB.getValue(columnId));

  if (!Number.isFinite(a) && !Number.isFinite(b)) return 0;
  if (!Number.isFinite(a)) return -1;
  if (!Number.isFinite(b)) return 1;

  return a === b ? 0 : a > b ? 1 : -1;
};

export const voucherSortingFns = {
  voucherDate: voucherDateSortingFn,
  voucherNumeric: voucherNumericSortingFn,
};

const voucherSearchFilterFn: FilterFn<Voucher> = (row, _columnId, filterValue) => {
  const search = String(filterValue ?? '')
    .trim()
    .toLowerCase();
  if (!search) return true;

  const voucher = row.original;
  const searchable = (value: unknown) => String(value ?? '').toLowerCase();

  return (
    searchable(voucher.voucherNo).includes(search) ||
    searchable(voucher.narration).includes(search) ||
    searchable(voucher.debit).includes(search) ||
    searchable(voucher.credit).includes(search) ||
    searchable(voucher.amount).includes(search)
  );
};

export const voucherFilterFns = {
  voucherSearch: voucherSearchFilterFn,
};

type VoucherColumnsOptions = {
  onEdit: (voucher: Voucher) => void;
  onDelete: (voucher: Voucher) => void;
};

export function createVoucherColumns({
  onEdit,
  onDelete,
}: VoucherColumnsOptions): ColumnDef<Voucher>[] {
  return [
    {
      accessorKey: 'voucherNo',
      header: 'Voucher No.',
      filterFn: voucherSearchFilterFn,
      meta: { mono: true },
      cell: ({ row }) => <span title={row.getValue('voucherNo')}>{row.getValue('voucherNo')}</span>,
    },
    {
      accessorKey: 'date',
      header: 'Date',
      meta: { numeric: true },
      sortingFn: voucherDateSortingFn,
      cell: ({ row }) => <span>{formatDate(row.getValue('date'))}</span>,
    },
    {
      accessorKey: 'debit',
      header: 'Debit',
      meta: { wrap: true },
      cell: ({ row }) => <span title={row.getValue('debit')}>{row.getValue('debit')}</span>,
    },
    {
      accessorKey: 'credit',
      header: 'Credit',
      meta: { wrap: true },
      cell: ({ row }) => <span title={row.getValue('credit')}>{row.getValue('credit')}</span>,
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      meta: { align: 'right', numeric: true },
      sortingFn: voucherNumericSortingFn,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('amount'));
        return <span>{currencyFormatter.format(amount)}</span>;
      },
    },
    {
      accessorKey: 'narration',
      header: 'Narration',
      meta: { wrap: true },
      cell: ({ row }) => (
        <span className="text-muted-foreground" title={row.getValue('narration')}>
          {row.getValue('narration')}
        </span>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const voucher = row.original;

        return (
          <div className="flex items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9"
              aria-label={`Edit voucher ${voucher.voucherNo}`}
              onClick={() => onEdit(voucher)}
            >
              <Pencil className="size-4" aria-hidden />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive size-9"
              aria-label={`Delete voucher ${voucher.voucherNo}`}
              onClick={() => onDelete(voucher)}
            >
              <Trash2 className="size-4" aria-hidden />
            </Button>
          </div>
        );
      },
    },
  ];
}
