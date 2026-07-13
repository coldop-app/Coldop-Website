import { Package, Wheat } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardAction, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatQuantity } from '@/features/daybook/utils/format';
import type { StockQuantityMode } from '@/features/people/utils/build-farmer-stock-summary';
import { cn } from '@/lib/utils';

const QUANTITY_MODE_LABELS: Record<StockQuantityMode, string> = {
  current: 'current quantity',
  initial: 'initial quantity',
  outgoing: 'outgoing quantity',
};

type VarietyBreakdownSummaryCardsProps = {
  variety: string;
  totalQuantity: number;
  quantityMode: StockQuantityMode;
};

export function VarietyBreakdownSummaryCards({
  variety,
  totalQuantity,
  quantityMode,
}: VarietyBreakdownSummaryCardsProps) {
  const highlight = quantityMode === 'current';

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Card size="sm" className="card-hover gap-0">
        <CardHeader className="pb-2">
          <CardDescription className="text-xs font-medium tracking-wider uppercase">
            Variety
          </CardDescription>
          <CardAction>
            <div className="bg-primary/10 flex size-9 items-center justify-center rounded-xl">
              <Wheat className="text-primary size-4" aria-hidden />
            </div>
          </CardAction>
        </CardHeader>

        <CardContent>
          <Badge variant="outline" className="w-fit text-sm font-medium">
            {variety}
          </Badge>
        </CardContent>
      </Card>

      <Card size="sm" className="card-hover gap-0">
        <CardHeader className="pb-2">
          <CardDescription className="text-xs font-medium tracking-wider uppercase">
            Total quantity
          </CardDescription>
          <CardAction>
            <div className="bg-primary/10 flex size-9 items-center justify-center rounded-xl">
              <Package className="text-primary size-4" aria-hidden />
            </div>
          </CardAction>
        </CardHeader>

        <CardContent className="flex flex-col gap-1.5">
          <p
            className={cn(
              'font-heading text-2xl font-semibold tracking-tight tabular-nums',
              highlight ? 'text-primary' : 'text-foreground',
            )}
          >
            {formatQuantity(totalQuantity)}
          </p>
          <p className="text-muted-foreground text-sm">
            bags · {QUANTITY_MODE_LABELS[quantityMode]}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function VarietyBreakdownSummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {Array.from({ length: 2 }).map((_, index) => (
        <Card key={index} size="sm" className="gap-0">
          <CardHeader className="pb-2">
            <Skeleton className="h-3 w-24" />
            <CardAction>
              <Skeleton className="size-9 rounded-xl" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-28" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
