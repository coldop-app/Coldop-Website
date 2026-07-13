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
import { useDeleteLedger } from '@/features/finances/api/use-delete-ledger';

import type { Ledger } from './types';

type DeleteLedgerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ledger: Ledger;
};

export function DeleteLedgerDialog({ open, onOpenChange, ledger }: DeleteLedgerDialogProps) {
  const { mutateAsync: deleteLedger, isPending } = useDeleteLedger();

  const handleDelete = async () => {
    try {
      await deleteLedger(ledger.id);
      toast.success('Ledger deleted successfully', {
        position: 'bottom-right',
      });
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete ledger', {
        position: 'bottom-right',
      });
    }
  };

  const hasTransactions = ledger.transactionCount > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <Trash2 />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete {ledger.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            {hasTransactions ? (
              <>
                This ledger has{' '}
                <span className="text-foreground font-medium tabular-nums">
                  {ledger.transactionCount}
                </span>{' '}
                transaction
                {ledger.transactionCount === 1 ? '' : 's'} and cannot be deleted until those entries
                are removed.
              </>
            ) : (
              <>
                This will permanently remove the{' '}
                <span className="text-foreground font-medium">{ledger.type}</span> ledger (
                {ledger.category}). This action cannot be undone.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending || hasTransactions}
            onClick={() => void handleDelete()}
          >
            {isPending ? 'Deleting…' : 'Delete Ledger'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
