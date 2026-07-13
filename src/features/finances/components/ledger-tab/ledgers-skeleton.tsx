import { Skeleton } from '@/components/ui/skeleton';

function LedgerTableRowSkeleton() {
  return (
    <div className="border-border grid grid-cols-9 gap-3 border-b px-3 py-3 last:border-0">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="ml-auto h-4 w-20" />
      <Skeleton className="ml-auto h-4 w-20" />
      <Skeleton className="ml-auto h-4 w-20" />
      <Skeleton className="h-4 w-14" />
      <Skeleton className="ml-auto h-8 w-16" />
    </div>
  );
}

export function LedgersSkeleton() {
  return (
    <div className="border-border overflow-hidden rounded-lg border">
      <div className="border-border bg-muted/50 border-b px-3 py-2.5">
        <div className="grid grid-cols-9 gap-3">
          {Array.from({ length: 9 }).map((_, index) => (
            <Skeleton key={index} className="h-4 w-16" />
          ))}
        </div>
      </div>
      <div>
        {Array.from({ length: 6 }).map((_, index) => (
          <LedgerTableRowSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
