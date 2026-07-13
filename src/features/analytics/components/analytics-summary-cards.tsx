import { Package, Ruler, User, Wheat, type LucideIcon } from 'lucide-react';

import { Card, CardAction, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import type { AnalyticsSummaryCards } from '@/features/analytics/utils/build-analytics-summary-cards';

type AnalyticsSummaryCardsProps = {
  cards: AnalyticsSummaryCards;
};

type CardConfig = {
  key: keyof AnalyticsSummaryCards;
  icon: LucideIcon;
};

const CARD_CONFIG: CardConfig[] = [
  { key: 'totalInventory', icon: Package },
  { key: 'topVariety', icon: Wheat },
  { key: 'topSize', icon: Ruler },
  { key: 'topFarmer', icon: User },
];

function SummaryCard({
  label,
  value,
  subtext,
  icon: Icon,
  highlight = false,
}: {
  label: string;
  value: string;
  subtext: string;
  icon: LucideIcon;
  highlight?: boolean;
}) {
  return (
    <Card size="sm" className="card-hover gap-0">
      <CardHeader className="pb-2">
        <CardDescription className="text-xs font-medium tracking-wider uppercase">
          {label}
        </CardDescription>
        <CardAction>
          <div
            className={cn(
              'bg-primary/10 flex size-9 items-center justify-center rounded-xl',
              'group-hover/card:bg-primary/15 transition-colors duration-200',
            )}
          >
            <Icon
              className="text-primary size-4 transition-transform duration-200 group-hover/card:scale-105"
              aria-hidden
            />
          </div>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-1.5">
        <p
          className={cn(
            'font-heading text-2xl font-semibold tracking-tight tabular-nums',
            highlight ? 'text-primary' : 'text-foreground',
          )}
          title={value}
        >
          <span className="line-clamp-2 break-words">{value}</span>
        </p>

        <p className="text-muted-foreground text-sm">{subtext}</p>
      </CardContent>
    </Card>
  );
}

export function AnalyticsSummaryCards({ cards }: AnalyticsSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {CARD_CONFIG.map(({ key, icon }) => {
        const card = cards[key];

        return (
          <SummaryCard
            key={key}
            label={card.label}
            value={card.value}
            subtext={card.subtext}
            icon={icon}
            highlight={card.highlight}
          />
        );
      })}
    </div>
  );
}

export function AnalyticsSummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {CARD_CONFIG.map(({ key }) => (
        <Card key={key} size="sm" className="gap-0">
          <CardHeader className="pb-2">
            <Skeleton className="h-3 w-24" />
            <CardAction>
              <Skeleton className="size-9 rounded-xl" />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-1.5">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
