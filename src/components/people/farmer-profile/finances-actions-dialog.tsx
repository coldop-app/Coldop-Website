import { memo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  IndianRupee,
  Wallet,
  Percent,
  Receipt,
} from 'lucide-react';

export interface FinancesActionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAction?: (action: string) => void;
}

const ACTIONS = [
  {
    id: 'buy-potato',
    label: 'Buy Potato',
    icon: ArrowDownToLine,
    iconClass:
      'bg-blue-50 border border-blue-500/80 text-blue-600 dark:bg-blue-950/50 dark:border-blue-500/60 dark:text-blue-400',
  },
  {
    id: 'sell-potato',
    label: 'Sell Potato',
    icon: ArrowUpFromLine,
    iconClass:
      'bg-emerald-50 border border-emerald-500/80 text-emerald-600 dark:bg-emerald-950/50 dark:border-emerald-500/60 dark:text-emerald-400',
  },
  {
    id: 'receive-payment',
    label: 'Receive Payment',
    icon: IndianRupee,
    iconClass:
      'bg-violet-50 border border-violet-500/80 text-violet-600 dark:bg-violet-950/50 dark:border-violet-500/60 dark:text-violet-400',
  },
  {
    id: 'add-payment',
    label: 'Add Payment',
    icon: Wallet,
    iconClass:
      'bg-amber-50 border border-amber-500/80 text-amber-600 dark:bg-amber-950/50 dark:border-amber-500/60 dark:text-amber-400',
  },
  {
    id: 'add-discount',
    label: 'Add Discount',
    icon: Percent,
    iconClass:
      'bg-teal-50 border border-teal-500/80 text-teal-600 dark:bg-teal-950/50 dark:border-teal-500/60 dark:text-teal-400',
  },
  {
    id: 'add-charge',
    label: 'Add Charge',
    icon: Receipt,
    iconClass:
      'bg-indigo-50 border border-indigo-600/80 text-indigo-600 dark:bg-indigo-950/50 dark:border-indigo-500/60 dark:text-indigo-400',
  },
] as const;

const ICON_STROKE = 1.5;

const FinancesActionsDialog = memo(function FinancesActionsDialog({
  open,
  onOpenChange,
  onAction,
}: FinancesActionsDialogProps) {
  const handleAction = (id: string) => {
    onAction?.(id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="font-custom border-border bg-card text-card-foreground max-w-md gap-0 overflow-hidden rounded-xl p-0 shadow-sm sm:max-w-lg"
        aria-describedby={undefined}
      >
        <div className="space-y-6 p-4 pr-12 sm:p-5 sm:pr-12">
          <DialogHeader className="space-y-0">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl sm:h-14 sm:w-14">
                <Wallet className="text-primary h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <DialogTitle className="font-custom text-xl font-bold tracking-tight text-card-foreground sm:text-2xl">
                Finances
              </DialogTitle>
            </div>
          </DialogHeader>

          <Separator className="bg-border" />

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {ACTIONS.map(({ id, label, icon: Icon, iconClass }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleAction(id)}
                className="flex items-center gap-3 rounded-xl border border-border bg-background/50 p-4 transition-colors duration-200 ease-in-out hover:bg-accent/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:border-border dark:bg-background/30 dark:hover:bg-accent/30"
                aria-label={label}
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
                  aria-hidden
                >
                  <Icon
                    className="h-5 w-5 sm:h-6 sm:w-6"
                    strokeWidth={ICON_STROKE}
                  />
                </div>
                <span className="font-custom text-left text-sm font-semibold text-foreground">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

export default FinancesActionsDialog;
