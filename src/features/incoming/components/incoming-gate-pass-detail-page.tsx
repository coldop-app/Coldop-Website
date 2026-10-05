import { useMemo, type ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { usePreferencesStore } from '@/features/auth/store/use-preferences-store';
import { BagLocationTrail } from '@/features/daybook/components/incoming-gate-pass-card';
import {
  formatDaybookDateTime,
  formatManualParchi,
  formatQuantity,
} from '@/features/daybook/utils/format';
import {
  isIncomingGatePassNotFound,
  useIncomingGatePass,
} from '@/features/incoming/api/use-incoming-gate-pass';
import type { IncomingGatePassDetail } from '@/features/incoming/types/api';
import {
  getBagSizeOrderForVariety,
  sortByPreferenceOrder,
} from '@/features/incoming/utils/incoming-preferences';
import { cn } from '@/lib/utils';

type IncomingGatePassDetailPageProps = {
  id: string;
};

function DetailField({
  label,
  value,
  mono = false,
  wrap = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  wrap?: boolean;
}) {
  return (
    <div className="min-w-0 space-y-1">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p
        className={cn(
          'text-foreground text-sm font-semibold',
          wrap ? 'break-words' : 'truncate',
          mono && 'font-mono tabular-nums',
        )}
        title={value}
      >
        {value}
      </p>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
      <Card className="border-border/60 overflow-hidden">
        <CardHeader className="border-border/40 bg-muted/10 gap-3 border-b">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="pt-5">
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-full max-w-28" />
              </div>
            ))}
          </div>
          <div className="border-border/40 mt-6 border-t pt-5">
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DetailStatus({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
      <Empty className="border-border border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertCircle aria-hidden />
          </EmptyMedia>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>{description}</EmptyDescription>
        </EmptyHeader>
        {action ? <EmptyContent>{action}</EmptyContent> : null}
      </Empty>
    </div>
  );
}

function GatePassBody({ entry }: { entry: IncomingGatePassDetail }) {
  const preferences = usePreferencesStore((state) => state.preferences);

  const bagSizes = useMemo(() => {
    const commodities = preferences?.commodities ?? [];
    const sizeOrder = getBagSizeOrderForVariety(commodities, entry.variety);
    return sortByPreferenceOrder(entry.bagSizes, sizeOrder);
  }, [entry.bagSizes, entry.variety, preferences?.commodities]);

  const farmer = entry.farmerStorageLinkId;
  const marka = entry.customMarka?.trim() || '—';
  const manualParchi = formatManualParchi(entry.manualParchiNumber);

  return (
    <div className="flex min-w-0 flex-col gap-4 sm:gap-6">
      <Card className="border-border/60 overflow-hidden">
        <CardHeader className="border-border/40 bg-muted/10 flex flex-col gap-4 border-b sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <CardTitle className="flex flex-wrap items-center gap-3 text-xl">
              <span className="bg-primary h-2 w-2 rounded-full" />
              IGP <span className="text-primary font-mono tabular-nums">#{entry.gatePassNo}</span>
              {manualParchi !== '—' ? (
                <Badge variant="outline" className="bg-background font-mono text-xs uppercase">
                  Manual: {manualParchi}
                </Badge>
              ) : null}
            </CardTitle>
            <p className="text-muted-foreground text-xs">{formatDaybookDateTime(entry.date)}</p>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3">
            <DetailField label="Farmer" value={farmer.name} wrap />
            <DetailField label="Variety" value={entry.variety} />
            <DetailField label="Marka" value={marka} mono />
          </div>
          <div className="border-border/40 mt-6 border-t pt-5">
            <div className="border-border/50 overflow-x-auto rounded-xl border">
              <table className="w-full text-sm">
                <thead className="border-border/50 bg-muted/50 border-b">
                  <tr>
                    <th className="text-muted-foreground h-10 px-3 text-left text-xs font-medium">
                      Size
                    </th>
                    <th className="text-muted-foreground h-10 px-3 text-right text-xs font-medium">
                      Initial qty
                    </th>
                    <th className="text-muted-foreground h-10 px-3 text-right text-xs font-medium">
                      Current qty
                    </th>
                    <th className="text-muted-foreground h-10 px-3 text-left text-xs font-medium">
                      Location
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bagSizes.map((bag, index) => (
                    <tr
                      key={`${bag.name}-${index}`}
                      className="border-border/40 border-b last:border-0"
                    >
                      <td className="text-foreground px-3 py-2.5 font-medium">{bag.name}</td>
                      <td className="text-foreground px-3 py-2.5 text-right font-medium tabular-nums">
                        {formatQuantity(bag.initialQuantity)}
                      </td>
                      <td className="text-foreground px-3 py-2.5 text-right font-medium tabular-nums">
                        {formatQuantity(bag.currentQuantity)}
                      </td>
                      <td className="px-3 py-2.5 align-top">
                        <BagLocationTrail bag={bag} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
        <span>
          Created by <span className="text-foreground font-medium">{entry.createdBy.name}</span>
        </span>
        <span>Created {formatDaybookDateTime(entry.createdAt)}</span>
        <span>Updated {formatDaybookDateTime(entry.updatedAt)}</span>
      </p>
    </div>
  );
}

export function IncomingGatePassDetailPage({ id }: IncomingGatePassDetailPageProps) {
  const { data, isLoading, isError, error, refetch, isFetching } = useIncomingGatePass(id);

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (isError && isIncomingGatePassNotFound(error)) {
    return (
      <DetailStatus
        title="Gate pass not found"
        description="This incoming gate pass is missing, or it does not belong to this cold storage."
      />
    );
  }

  if (isError || !data) {
    const message = error instanceof Error ? error.message : 'Failed to load incoming gate pass';

    return (
      <DetailStatus
        title="Could not load gate pass"
        description={message}
        action={
          <Button
            type="button"
            variant="outline"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw className={cn('size-4', isFetching && 'animate-spin')} aria-hidden />
            Try again
          </Button>
        }
      />
    );
  }

  return <GatePassBody entry={data} />;
}
