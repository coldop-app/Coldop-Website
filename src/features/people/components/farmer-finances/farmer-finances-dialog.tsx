import { useState } from 'react';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  IndianRupee,
  Percent,
  Receipt,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AddChargeDialog } from '@/features/people/components/farmer-finances/add-charge-dialog';
import { AddDiscountDialog } from '@/features/people/components/farmer-finances/add-discount-dialog';
import { AddPaymentDialog } from '@/features/people/components/farmer-finances/add-payment-dialog';
import { BuyPotatoDialog } from '@/features/people/components/farmer-finances/buy-potato-dialog';
import { FarmerFinancesActionCard } from '@/features/people/components/farmer-finances/farmer-finances-action-card';
import { ReceivePaymentDialog } from '@/features/people/components/farmer-finances/receive-payment-dialog';
import { SellPotatoDialog } from '@/features/people/components/farmer-finances/sell-potato-dialog';
import type { FarmerFinanceAction } from '@/features/people/components/farmer-finances/types';

type FarmerFinancesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farmerName: string;
  linkId: string;
};

type FinanceActionConfig = {
  action: FarmerFinanceAction;
  label: string;
  icon: LucideIcon;
  iconClassName: string;
};

const FINANCE_ACTIONS: FinanceActionConfig[] = [
  {
    action: 'buy-potato',
    label: 'Buy Potato',
    icon: ArrowDownToLine,
    iconClassName: 'bg-chart-1/10 text-chart-1',
  },
  {
    action: 'sell-potato',
    label: 'Sell Potato',
    icon: ArrowUpFromLine,
    iconClassName: 'bg-chart-2/10 text-chart-2',
  },
  {
    action: 'receive-payment',
    label: 'Receive Payment',
    icon: IndianRupee,
    iconClassName: 'bg-chart-3/10 text-chart-3',
  },
  {
    action: 'add-payment',
    label: 'Add Payment',
    icon: Wallet,
    iconClassName: 'bg-chart-4/10 text-chart-4',
  },
  {
    action: 'add-discount',
    label: 'Add Discount',
    icon: Percent,
    iconClassName: 'bg-chart-5/10 text-chart-5',
  },
  {
    action: 'add-charge',
    label: 'Add Charge',
    icon: Receipt,
    iconClassName: 'bg-chart-6/10 text-chart-6',
  },
];

function handleHubOpenChange(
  nextOpen: boolean,
  onOpenChange: (open: boolean) => void,
  setActiveAction: (action: FarmerFinanceAction | null) => void,
) {
  if (!nextOpen) {
    setActiveAction(null);
  }

  onOpenChange(nextOpen);
}

function handleSubDialogOpenChange(
  nextOpen: boolean,
  setActiveAction: (action: FarmerFinanceAction | null) => void,
) {
  if (!nextOpen) {
    setActiveAction(null);
  }
}

export function FarmerFinancesDialog({
  open,
  onOpenChange,
  farmerName,
  linkId,
}: FarmerFinancesDialogProps) {
  const [activeAction, setActiveAction] = useState<FarmerFinanceAction | null>(null);

  const subDialogProps = {
    onOpenChange: (nextOpen: boolean) => handleSubDialogOpenChange(nextOpen, setActiveAction),
  };

  return (
    <>
      <Dialog
        open={open && activeAction === null}
        onOpenChange={(nextOpen) => handleHubOpenChange(nextOpen, onOpenChange, setActiveAction)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="flex-row items-center gap-3 text-left">
            <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
              <Wallet className="size-5" aria-hidden />
            </div>
            <DialogTitle className="font-heading text-base font-semibold">Finances</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {FINANCE_ACTIONS.map((item) => (
              <FarmerFinancesActionCard
                key={item.action}
                label={item.label}
                icon={item.icon}
                iconClassName={item.iconClassName}
                onClick={() => setActiveAction(item.action)}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <BuyPotatoDialog
        open={activeAction === 'buy-potato'}
        linkId={linkId}
        farmerName={farmerName}
        {...subDialogProps}
      />
      <SellPotatoDialog
        open={activeAction === 'sell-potato'}
        linkId={linkId}
        farmerName={farmerName}
        {...subDialogProps}
      />
      <ReceivePaymentDialog
        open={activeAction === 'receive-payment'}
        linkId={linkId}
        farmerName={farmerName}
        {...subDialogProps}
      />
      <AddPaymentDialog
        open={activeAction === 'add-payment'}
        linkId={linkId}
        farmerName={farmerName}
        {...subDialogProps}
      />
      <AddDiscountDialog
        open={activeAction === 'add-discount'}
        linkId={linkId}
        farmerName={farmerName}
        {...subDialogProps}
      />
      <AddChargeDialog
        open={activeAction === 'add-charge'}
        linkId={linkId}
        farmerName={farmerName}
        {...subDialogProps}
      />
    </>
  );
}
