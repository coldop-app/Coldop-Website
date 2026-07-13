import { cn } from '@/lib/utils';

type AllocationQuantitySummaryProps = {
  previouslyIssued: number;
  maxToIssue: number;
  issuingNow: number;
  className?: string;
};

function formatQty(value: number) {
  return value.toLocaleString('en-IN');
}

export function AllocationQuantitySummary({
  previouslyIssued,
  maxToIssue,
  issuingNow,
  className,
}: AllocationQuantitySummaryProps) {
  return (
    <div
      className={cn(
        'border-border/50 bg-card overflow-hidden rounded-lg border text-sm',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4 px-4 py-2.5">
        <span className="text-muted-foreground">Previously issued</span>
        <span className="text-muted-foreground tabular-nums">{formatQty(previouslyIssued)}</span>
      </div>
      <div className="flex items-center justify-between gap-4 px-4 py-2.5">
        <span className="text-foreground font-semibold">Max to issue</span>
        <span className="text-foreground font-semibold tabular-nums">{formatQty(maxToIssue)}</span>
      </div>
      <div className="border-border/50 border-t" />
      <div className="flex items-center justify-between gap-4 px-4 py-2.5">
        <span className="text-muted-foreground">Issuing now</span>
        <span className="text-foreground font-medium tabular-nums">{formatQty(issuingNow)}</span>
      </div>
    </div>
  );
}
