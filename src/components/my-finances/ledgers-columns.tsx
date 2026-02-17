import { type ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Ledger } from '@/services/accounting/ledgers/useGetAllLedgers';
import { Pencil, Trash2 } from 'lucide-react';

function formatAmount(value: number | null): string {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export interface LedgersColumnsHandlers {
  onEdit: (ledger: Ledger) => void;
  onDelete: (ledger: Ledger) => void;
}

export function getLedgersColumns(
  handlers: LedgersColumnsHandlers
): ColumnDef<Ledger>[] {
  const { onEdit, onDelete } = handlers;
  return [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <span className="font-custom font-medium">{row.getValue('name')}</span>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.getValue('type') as Ledger['type'];
        return (
          <Badge variant="secondary" className="font-custom font-normal">
            {type}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'subType',
      header: 'Sub type',
      cell: ({ row }) => (
        <span className="font-custom text-muted-foreground">
          {row.getValue('subType') ?? '—'}
        </span>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <span className="font-custom">{row.getValue('category') ?? '—'}</span>
      ),
    },
    {
      accessorKey: 'openingBalance',
      header: () => (
        <div className="font-custom text-right">Opening balance</div>
      ),
      cell: ({ row }) => (
        <div className="font-custom text-right font-medium tabular-nums">
          {formatAmount(row.original.openingBalance)}
        </div>
      ),
    },
    {
      accessorKey: 'balance',
      header: () => <div className="font-custom text-right">Balance</div>,
      cell: ({ row }) => (
        <div className="font-custom text-right font-medium tabular-nums">
          {formatAmount(row.original.balance)}
        </div>
      ),
    },
    {
      accessorKey: 'closingBalance',
      header: () => (
        <div className="font-custom text-right">Closing balance</div>
      ),
      cell: ({ row }) => (
        <div className="font-custom text-right tabular-nums">
          {formatAmount(row.original.closingBalance)}
        </div>
      ),
    },
    {
      accessorKey: 'isSystemLedger',
      header: 'Kind',
      cell: ({ row }) => (
        <Badge
          variant={row.original.isSystemLedger ? 'secondary' : 'outline'}
          className="font-custom font-normal"
        >
          {row.original.isSystemLedger ? 'System' : 'Custom'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: () => <div className="font-custom text-right">Actions</div>,
      cell: ({ row }) => {
        const ledger = row.original;
        return (
          <div className="font-custom flex justify-end gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="focus-visible:ring-primary h-8 w-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              aria-label={`Edit ${ledger.name}`}
              onClick={() => onEdit(ledger)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-destructive hover:bg-destructive/10 focus-visible:ring-primary h-8 w-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              aria-label={`Delete ${ledger.name}`}
              onClick={() => onDelete(ledger)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];
}
