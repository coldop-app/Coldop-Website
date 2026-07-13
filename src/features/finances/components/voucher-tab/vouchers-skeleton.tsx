import { Skeleton } from '@/components/ui/skeleton';

function VoucherTableRowSkeleton() {
  return (
    <div className="border-border grid grid-cols-7 gap-3 border-b px-3 py-3 last:border-0">
      <Skeleton className="h-4 w-12" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-4 w-28" />
      <Skeleton className="ml-auto h-4 w-16" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="ml-auto h-8 w-16" />
    </div>
  );
}

export function VouchersSkeleton() {
  return (
    <div className="border-border overflow-hidden rounded-lg border">
      <div className="border-border bg-muted/50 border-b px-3 py-2.5">
        <div className="grid grid-cols-7 gap-3">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton key={index} className="h-4 w-16" />
          ))}
        </div>
      </div>
      <div>
        {Array.from({ length: 6 }).map((_, index) => (
          <VoucherTableRowSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
