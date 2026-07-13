import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

function ReportTableCardSkeleton({ titleWidth = 'w-44' }: { titleWidth?: string }) {
  return (
    <div className="border-border bg-card overflow-hidden rounded-xl border shadow-sm">
      <div className="border-border flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className={`h-5 ${titleWidth}`} />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>

      <div className="p-4 sm:p-5">
        <div className="border-border min-w-0 overflow-hidden rounded-lg border">
          <div className="max-h-[min(70vh,42rem)] overflow-hidden">
            <div className="border-border bg-muted/50 border-b px-3 py-3">
              <div className="flex gap-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-4 w-20 shrink-0" />
                ))}
              </div>
            </div>
            {Array.from({ length: 6 }).map((_, rowIndex) => (
              <div
                key={rowIndex}
                className="border-border/35 even:bg-muted/20 flex gap-3 border-b px-3 py-3"
              >
                {Array.from({ length: 6 }).map((__, colIndex) => (
                  <Skeleton key={colIndex} className="h-4 w-16 shrink-0" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FarmerReportTableSkeleton() {
  return (
    <>
      <ReportTableCardSkeleton titleWidth="w-44" />
      <ReportTableCardSkeleton titleWidth="w-44" />
    </>
  );
}

export function FarmerReportHeaderSkeleton() {
  return (
    <div className="border-border bg-card overflow-hidden rounded-xl border shadow-sm">
      <div className="space-y-2 p-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Separator />
      <div className="bg-muted/20 space-y-3 p-4">
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-24" />
        </div>
        <Skeleton className="h-6 w-28 rounded-full" />
      </div>
    </div>
  );
}
