import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatQuantity } from '@/features/daybook/utils/format';
import { cn } from '@/lib/utils';

type AnalyticsCapacityUtilizationProps = {
  currentQuantity: number;
  totalCapacity: number | null | undefined;
};

function formatPercent(value: number): string {
  return `${value.toLocaleString('en-IN', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

export function AnalyticsCapacityUtilization({
  currentQuantity,
  totalCapacity,
}: AnalyticsCapacityUtilizationProps) {
  const hasCapacity = typeof totalCapacity === 'number' && totalCapacity > 0;

  if (!hasCapacity) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base font-semibold">
            Capacity Utilization
          </CardTitle>
          <CardDescription>Based on current quantity</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Capacity not configured. Update cold storage capacity in profile settings.
          </p>
        </CardContent>
      </Card>
    );
  }

  const available = Math.max(totalCapacity - currentQuantity, 0);
  const utilizationPercent = Math.min((currentQuantity / totalCapacity) * 100, 100);
  const displayPercent = (currentQuantity / totalCapacity) * 100;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-base font-semibold">Capacity Utilization</CardTitle>
        <CardDescription>Based on current quantity</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <p className="text-foreground text-sm font-medium tabular-nums">
          {formatQuantity(currentQuantity)} / {formatQuantity(totalCapacity)} bags
          <span className="text-muted-foreground"> ({formatPercent(displayPercent)})</span>
        </p>

        <div className="space-y-2">
          <div className="bg-muted h-2.5 overflow-hidden rounded-full">
            <div
              className="bg-primary h-full rounded-full transition-[width] duration-300"
              style={{ width: `${utilizationPercent}%` }}
            />
          </div>

          <div className="text-muted-foreground flex justify-between text-xs">
            <span>0%</span>
            <span className="text-foreground font-medium tabular-nums">
              {formatPercent(displayPercent)} used
            </span>
            <span>100%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="border-border bg-card rounded-lg border p-4">
            <p className="font-heading text-foreground text-xl font-semibold tabular-nums">
              {formatQuantity(available)}
            </p>
            <p className="text-muted-foreground mt-1 text-sm">Available space</p>
          </div>

          <div className={cn('border-border rounded-lg border p-4', 'bg-muted/30')}>
            <p className="font-heading text-foreground text-xl font-semibold tabular-nums">
              {formatQuantity(currentQuantity)}
            </p>
            <p className="text-muted-foreground mt-1 text-sm">Currently stored</p>
          </div>

          <div className={cn('border-border rounded-lg border p-4', 'bg-primary/5')}>
            <p className="font-heading text-primary text-xl font-semibold tabular-nums">
              {formatQuantity(totalCapacity)}
            </p>
            <p className="text-muted-foreground mt-1 text-sm">Total capacity</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
