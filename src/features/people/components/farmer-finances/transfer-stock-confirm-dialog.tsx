import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

type TransferStockConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onContinueWithVoucher: () => void;
  onTransferStock: () => void;
};

export function TransferStockConfirmDialog({
  open,
  onOpenChange,
  title,
  onContinueWithVoucher,
  onTransferStock,
}: TransferStockConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>Do you want to transfer stock?</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <Button type="button" variant="outline" onClick={onContinueWithVoucher}>
            No
          </Button>
          <Button type="button" onClick={onTransferStock}>
            Yes
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
