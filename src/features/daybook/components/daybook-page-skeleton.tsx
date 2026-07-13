import { Item, ItemActions, ItemContent, ItemMedia } from '@/components/ui/item';
import { Skeleton } from '@/components/ui/skeleton';
import { IncomingGatePassCardSkeleton } from './incoming-gate-pass-card';
import { OutgoingGatePassCardSkeleton } from './outgoing-gate-pass-card';

export function DaybookPageSkeleton() {
  return (
    <div className="flex w-full flex-col gap-4">
      <Item variant="outline" size="sm">
        <ItemMedia variant="icon">
          <Skeleton className="h-10 w-10 rounded-lg" />
        </ItemMedia>

        <ItemContent>
          <Skeleton className="h-5 w-32" />
        </ItemContent>

        <ItemActions>
          <Skeleton className="h-9 w-24 rounded-md" />
        </ItemActions>
      </Item>

      <div className="bg-card text-card-foreground flex flex-col gap-3 rounded-xl border p-3 shadow-sm sm:gap-4 sm:p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Skeleton className="order-1 h-9 w-full rounded-md sm:order-2 sm:flex-1" />
          <Skeleton className="order-2 h-9 w-full rounded-md sm:order-1 sm:w-[150px] sm:shrink-0" />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row">
            <Skeleton className="h-9 w-full rounded-md sm:w-[150px]" />
            <Skeleton className="h-9 w-full rounded-md sm:w-[150px]" />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0 sm:flex-row">
            <Skeleton className="h-9 w-full rounded-md sm:w-36" />
            <Skeleton className="h-9 w-full rounded-md sm:w-36" />
            <Skeleton className="h-9 w-full rounded-md sm:w-36" />
            <Skeleton className="h-9 w-full rounded-md sm:w-36" />
          </div>
        </div>
      </div>

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
