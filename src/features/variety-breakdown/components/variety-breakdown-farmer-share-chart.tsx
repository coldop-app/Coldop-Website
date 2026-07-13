import { useMemo } from 'react';
import { Users } from 'lucide-react';
import { Cell, Pie, PieChart } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AnalyticsDistributionTable } from '@/features/analytics/components/analytics-distribution-table';
import type { AnalyticsDistribution } from '@/features/analytics/utils/build-analytics-distribution';
import type { DistributionItem } from '@/features/analytics/utils/build-analytics-distribution';
import { formatQuantity } from '@/features/daybook/utils/format';
import type { StockQuantityMode } from '@/features/people/utils/build-farmer-stock-summary';

import { buildFarmerCountInsight, buildTopItemInsight } from '../utils/build-distribution-insights';
import { VarietyBreakdownInsights } from './variety-breakdown-insights';

const QUANTITY_MODE_SUBTITLES: Record<StockQuantityMode, string> = {
  current: 'Percentage breakdown by farmer (current stock)',
  initial: 'Percentage breakdown by farmer (initial stock)',
  outgoing: 'Percentage breakdown by farmer (outgoing stock)',
};

function formatShare(value: number): string {
  return `${value.toLocaleString('en-IN', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

type VarietyBreakdownFarmerShareChartProps = {
  distribution: AnalyticsDistribution;
  quantityMode: StockQuantityMode;
};

export function VarietyBreakdownFarmerShareChart({
  distribution,
  quantityMode,
}: VarietyBreakdownFarmerShareChartProps) {
  const pieData = distribution.items;

  const insights = useMemo(() => {
    const topFarmer = buildTopItemInsight(distribution.tableItems, 'contributor', 'inventory');
    const farmerCount = buildFarmerCountInsight(distribution.tableItems.length);

    return [topFarmer, farmerCount].filter(
      (insight): insight is NonNullable<typeof insight> => insight !== null,
    );
  }, [distribution.tableItems]);

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-2 text-base font-semibold">
          <Users className="text-primary size-5" aria-hidden />
          Farmer-wise share
        </CardTitle>
        <CardDescription>{QUANTITY_MODE_SUBTITLES[quantityMode]}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 sm:space-y-6">
        {pieData.length === 0 ? (
          <p className="text-muted-foreground text-sm">No farmer data for this view.</p>
        ) : (
          <>
            <ChartContainer
              config={distribution.chartConfig}
              className="[&_.recharts-pie-label-text]:fill-foreground mx-auto min-h-[220px] w-full max-w-md sm:min-h-[280px] [&_.recharts-pie-label-text]:text-xs"
            >
              <PieChart accessibilityLayer margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      nameKey="key"
                      labelFormatter={(_, payload) => {
                        const item = payload?.[0]?.payload as DistributionItem | undefined;
                        return item?.label ?? null;
                      }}
                      formatter={(value, _name, item) => {
                        const share = (item.payload as DistributionItem).share;

                        return (
                          <div className="flex w-full flex-col gap-0.5 text-xs">
                            <span className="text-foreground font-medium tabular-nums">
                              {formatQuantity(Number(value))} bags
                            </span>
                            <span className="text-primary tabular-nums">{formatShare(share)}</span>
                          </div>
                        );
                      }}
                    />
                  }
                />
                <Pie
                  data={pieData}
                  dataKey="bags"
                  nameKey="key"
                  cx="50%"
                  cy="50%"
                  innerRadius="52%"
                  outerRadius="82%"
                  paddingAngle={2}
                  cornerRadius={4}
                  label={({ name, percent, payload }) => {
                    const label = (payload as { label?: string } | undefined)?.label ?? name;
                    return `${label}: ${((percent ?? 0) * 100).toFixed(1)}%`;
                  }}
                  labelLine={{ stroke: 'var(--border)', strokeWidth: 1 }}
                >
                  {pieData.map((entry) => (
                    <Cell
                      key={entry.key}
                      fill={entry.fill}
                      stroke="var(--background)"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>

            <AnalyticsDistributionTable distribution={distribution} labelColumn="Farmer" />

            <VarietyBreakdownInsights insights={insights} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
