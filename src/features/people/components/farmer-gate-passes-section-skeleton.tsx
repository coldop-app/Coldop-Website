import { Item, ItemActions, ItemContent, ItemMedia } from '@/components/ui/item';
import { Skeleton } from '@/components/ui/skeleton';
import { IncomingGatePassCardSkeleton } from '@/features/daybook/components/incoming-gate-pass-card';
import { OutgoingGatePassCardSkeleton } from '@/features/daybook/components/outgoing-gate-pass-card';
import { FarmerGatePassesToolbarSkeleton } from '@/features/people/components/farmer-gate-passes-toolbar';
import { FarmerStockSummarySkeleton } from '@/features/people/components/farmer-stock-summary-skeleton';

export function FarmerGatePassesSectionSkeleton() {
  return (
    <div className="flex w-full flex-col gap-4">
      <FarmerGatePassesToolbarSkeleton />

      <FarmerStockSummarySkeleton embedded />

      <Item variant="outline" size="sm">
        <ItemMedia variant="icon">
          <Skeleton className="size-10 rounded-lg" />
        </ItemMedia>

        <ItemContent>
          <Skeleton className="h-5 w-40" />
        </ItemContent>

        <ItemActions>
          <Skeleton className="h-9 w-24 rounded-md" />
        </ItemActions>
      </Item>

      <div className="flex flex-col gap-4">
        <IncomingGatePassCardSkeleton />
        <OutgoingGatePassCardSkeleton />
        <IncomingGatePassCardSkeleton />
      </div>

      <Item variant="outline" size="sm" className="rounded-xl px-4 py-3 sm:px-5 sm:py-4">
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-9 w-48 rounded-md" />
        </div>
      </Item>
    </div>
  );
}
