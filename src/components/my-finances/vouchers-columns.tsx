import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import type { Voucher } from '@/services/accounting/vouchers/useGetAllVouchers';
import { Pencil, Trash2 } from 'lucide-react';

function formatAmount(value: number | null | undefined): string {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  try {
    const d = new Date(value);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return value;
  }
}

export interface VouchersColumnsHandlers {
  onEdit: (voucher: Voucher) => void;
  onDelete: (voucher: Voucher) => void;
}

export function getVouchersColumns(
  handlers: VouchersColumnsHandlers
): ColumnDef<Voucher>[] {
  const { onEdit, onDelete } = handlers;
  return [
    {
      accessorKey: 'voucherNumber',
      header: 'Voucher #',
      cell: ({ row }) => (
        <span className="font-custom font-medium tabular-nums">
          {row.getValue('voucherNumber')}
        </span>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => (
        <span className="font-custom text-muted-foreground">
          {formatDate(row.original.date)}
        </span>
      ),
    },
    {
      id: 'debitLedger',
      header: 'Debit',
      cell: ({ row }) => (
        <span className="font-custom">
          {row.original.debitLedger?.name ?? '—'}
        </span>
      ),
    },
    {
      id: 'creditLedger',
      header: 'Credit',
      cell: ({ row }) => (
        <span className="font-custom">
          {row.original.creditLedger?.name ?? '—'}
        </span>
      ),
    },
    {
      accessorKey: 'amount',
      header: () => <div className="font-custom text-right">Amount</div>,
      cell: ({ row }) => (
        <div className="font-custom text-right font-medium tabular-nums">
          {formatAmount(row.original.amount)}
        </div>
      ),
    },
    {
      accessorKey: 'narration',
      header: 'Narration',
      cell: ({ row }) => (
        <span className="font-custom text-muted-foreground line-clamp-2 max-w-[200px]">
          {row.original.narration ?? '—'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: () => <div className="font-custom text-right">Actions</div>,
      cell: ({ row }) => {
        const voucher = row.original;
        return (
          <div className="font-custom flex justify-end gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="focus-visible:ring-primary h-8 w-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              aria-label={`Edit voucher #${voucher.voucherNumber}`}
              onClick={() => onEdit(voucher)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-destructive hover:bg-destructive/10 focus-visible:ring-primary h-8 w-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              aria-label={`Delete voucher #${voucher.voucherNumber}`}
              onClick={() => onDelete(voucher)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];
}
