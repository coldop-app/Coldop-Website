import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useDeleteVoucher } from '@/features/finances/api/use-delete-voucher';

import type { Voucher } from './types';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
});

type DeleteVoucherDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voucher: Voucher;
};

export function DeleteVoucherDialog({ open, onOpenChange, voucher }: DeleteVoucherDialogProps) {
  const { mutateAsync: deleteVoucher, isPending } = useDeleteVoucher();

  const handleDelete = async () => {
    try {
      await deleteVoucher(voucher.id);
      toast.success('Voucher deleted successfully', {
        position: 'bottom-right',
      });
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete voucher', {
        position: 'bottom-right',
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <Trash2 />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete voucher #{voucher.voucherNo}?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove the journal entry for{' '}
            <span className="text-foreground font-medium tabular-nums">
              {currencyFormatter.format(voucher.amount)}
            </span>{' '}
            ({voucher.debit} → {voucher.credit}). Ledger balances will be reversed. This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={() => void handleDelete()}
          >
            {isPending ? 'Deleting…' : 'Delete Voucher'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
