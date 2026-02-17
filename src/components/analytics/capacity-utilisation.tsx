import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export type CapacityQuantityType = 'current' | 'initial' | 'outgoing';

export interface CapacityUtilisationProps {
  /** Quantity to show (e.g. bags in storage, received, or released). Defaults to 0 if not provided. */
  currentQuantity?: number;
  /** Total capacity (e.g. cold storage capacity in bags). If not set, progress shows 100% and total is shown as current. */
  totalCapacity?: number;
  /** When quantityType is "outgoing", use this as the total (denominator) so the widget shows "outgoing out of total current inventory". Same as the aggregated current quantity from the top summary card. */
  totalCurrentInventory?: number;
  /** Unit label for display (e.g. "bags"). */
  unit?: string;
  /** Which quantity is being shown; displayed as a label so users know the basis (current / initial / outgoing). */
  quantityType?: CapacityQuantityType;
}

const QUANTITY_TYPE_LABELS: Record<
  CapacityQuantityType,
  { short: string; cardLabel: string; totalLabel: string }
> = {
  current: {
    short: 'Current quantity',
    cardLabel: 'Currently Stored',
    totalLabel: 'Total Capacity',
  },
  initial: {
    short: 'Initial quantity',
    cardLabel: 'Initial quantity',
    totalLabel: 'Total Capacity',
  },
  outgoing: {
    short: 'Outgoing quantity',
    cardLabel: 'Outgoing (released)',
    totalLabel: 'Total current inventory',
  },
};

const CapacityUtilisation = memo(function CapacityUtilisation({
  currentQuantity = 0,
  totalCapacity,
  totalCurrentInventory,
  unit = 'bags',
  quantityType = 'current',
}: CapacityUtilisationProps) {
  const total =
    quantityType === 'outgoing' && totalCurrentInventory != null
      ? totalCurrentInventory
      : (totalCapacity ?? currentQuantity);
  const available = Math.max(0, total - currentQuantity);
  const percentage = total > 0 ? (currentQuantity / total) * 100 : 0;
  const percentageLabel = total > 0 ? `${percentage.toFixed(1)}%` : '0%';
  const typeLabels = QUANTITY_TYPE_LABELS[quantityType];

  return (
    <Card className="border-border rounded-xl shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-1">
          <CardTitle className="font-custom text-foreground text-base font-semibold sm:text-lg">
            Capacity Utilization
          </CardTitle>
          <p className="font-custom text-muted-foreground text-xs">
            Based on {typeLabels.short.toLowerCase()}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary text and progress bar */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-custom text-muted-foreground text-sm md:text-base">
              {currentQuantity.toLocaleString('en-IN')} /{' '}
              {total.toLocaleString('en-IN')} {unit} ({percentageLabel})
            </span>
          </div>
          {/* Extra top space so the percentage pill above the bar does not overlap the summary text */}
          <div className="relative flex flex-col pt-7">
            <span
              className="font-custom bg-background text-foreground absolute left-0 rounded-full border border-red-500/80 px-2 py-0.5 text-xs font-medium tabular-nums shadow-sm dark:border-red-400/70"
              style={{
                left: `clamp(0.5rem, ${percentage}%, calc(100% - 2.5rem))`,
                top: '0.25rem',
              }}
            >
              {percentageLabel}
            </span>
            <Progress
              value={percentage}
              className="bg-secondary mt-5 h-3 w-full rounded-full"
            />
          </div>
          <div className="font-custom text-muted-foreground flex justify-between text-xs">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Info cards */}
        <div
          className={cn(
            'grid gap-4',
            quantityType === 'outgoing' ? 'sm:grid-cols-2' : 'sm:grid-cols-3'
          )}
        >
          {quantityType !== 'outgoing' && (
            <div
              className={cn(
                'border-border bg-secondary/30 dark:bg-muted/40 rounded-lg border p-4 transition-colors duration-200'
              )}
            >
              <p className="font-custom text-foreground text-2xl font-bold tabular-nums">
                {available.toLocaleString('en-IN')}
              </p>
              <p className="font-custom text-muted-foreground text-sm">
                Available Space
              </p>
            </div>
          )}
          <div className="rounded-lg border border-blue-200 bg-blue-50/80 p-4 transition-colors duration-200 dark:border-blue-800 dark:bg-blue-950/50">
            <p className="font-custom text-2xl font-bold text-blue-600 tabular-nums dark:text-blue-400">
              {currentQuantity.toLocaleString('en-IN')}
            </p>
            <p className="font-custom text-muted-foreground text-sm">
              {typeLabels.cardLabel}
            </p>
          </div>
          <div className="border-primary/20 bg-primary/5 dark:bg-primary/10 dark:border-primary/30 rounded-lg border p-4 transition-colors duration-200">
            <p className="font-custom text-primary text-2xl font-bold tabular-nums">
              {total.toLocaleString('en-IN')}
            </p>
            <p className="font-custom text-muted-foreground text-sm">
              {typeLabels.totalLabel}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default CapacityUtilisation;
