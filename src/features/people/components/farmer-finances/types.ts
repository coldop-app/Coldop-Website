export type FarmerFinanceAction =
  'buy-potato' | 'sell-potato' | 'receive-payment' | 'add-payment' | 'add-discount' | 'add-charge';

export type FarmerFinanceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  linkId: string;
  farmerName?: string;
};
