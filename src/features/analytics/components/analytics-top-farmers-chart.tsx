'use client';

import { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { formatQuantity } from '@/features/daybook/utils/format';
import type { AnalyticsTopFarmersResponse } from '@/features/analytics/types';
import {
  buildTopFarmersBarChart,
  type TopFarmerBarItem,
} from '@/features/analytics/utils/build-top-farmers-bar-chart';
import type { StockQuantityMode } from '@/features/people/utils/build-farmer-stock-summary';
import { useIsMobile } from '@/hooks/use-mobile';

const QUANTITY_MODE_SUBTITLES: Record<StockQuantityMode, string> = {
  current: 'Top farmers by current inventory',
  initial: 'Top farmers by initial quantities',
  outgoing: 'Top farmers by outgoing quantities',
};

const DESKTOP_BAR_LAYOUT = {
  barSize: 42,
  rowHeight: 68,
  categoryGap: 22,
  minHeight: 260,
} as const;

const MOBILE_BAR_LAYOUT = {
  barSize: 32,
  rowHeight: 58,
  categoryGap: 22,
  minHeight: 220,
} as const;

function truncateFarmerLabel(label: string, maxLength = 28): string {
  if (label.length <= maxLength) return label;
  return `${label.slice(0, maxLength - 1).trim()}…`;
}

type AnalyticsTopFarmersChartProps = {
  topFarmers: AnalyticsTopFarmersResponse | null;
  quantityMode: StockQuantityMode;
};

export function AnalyticsTopFarmersChart({
  topFarmers,
  quantityMode,
}: AnalyticsTopFarmersChartProps) {
  const isMobile = useIsMobile();
  const barLayout = isMobile ? MOBILE_BAR_LAYOUT : DESKTOP_BAR_LAYOUT;

  const { items, chartConfig } = useMemo(
    () => buildTopFarmersBarChart(topFarmers, quantityMode),
    [topFarmers, quantityMode],
  );

  const chartHeight = Math.max(items.length * barLayout.rowHeight, barLayout.minHeight);

  const maxValueLabelWidth = useMemo(() => {
    const widest = items.reduce((max, item) => Math.max(max, formatQuantity(item.bags).length), 0);
    return Math.max(widest * 8 + 16, 48);
  }, [items]);

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-2 text-base font-semibold">
          <BarChart3 className="text-primary size-5" aria-hidden />
          Top farmers
        </CardTitle>
        <CardDescription>{QUANTITY_MODE_SUBTITLES[quantityMode]}</CardDescription>
      </CardHeader>

      <CardContent>
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm">No farmer data for this view.</p>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground w-full [&_.recharts-cartesian-axis-tick_text]:text-xs [&_.recharts-cartesian-axis-tick_text]:tabular-nums"
            style={{ height: chartHeight }}
          >
            <BarChart
              accessibilityLayer
              data={items}
              layout="vertical"
              barCategoryGap={barLayout.categoryGap}
              margin={{
                top: 8,
                right: maxValueLabelWidth,
                bottom: 8,
                left: 8,
              }}
            >
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="key"
                type="category"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                hide
              />
              <XAxis
                dataKey="bags"
                type="number"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={(value) => formatQuantity(Number(value))}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="line"
                    nameKey="key"
                    formatter={(value, _name, item) => {
                      const farmer = item.payload as TopFarmerBarItem;

                      return (
                        <div className="flex w-full flex-col gap-0.5 text-xs">
                          <span className="text-foreground font-medium">{farmer.label}</span>
                          <span className="text-foreground tabular-nums">
                            {formatQuantity(Number(value))} bags
                          </span>
                        </div>
                      );
                    }}
                  />
                }
              />
              <Bar dataKey="bags" fill="var(--primary)" radius={4} barSize={barLayout.barSize}>
                <LabelList
                  dataKey="label"
                  position="insideLeft"
                  offset={8}
                  className="fill-(--color-label)"
                  fontSize={12}
                  formatter={(value) => truncateFarmerLabel(String(value ?? ''))}
                />
                <LabelList
                  dataKey="bags"
                  position="right"
                  offset={8}
                  className="fill-foreground tabular-nums"
                  fontSize={12}
                  formatter={(value) => formatQuantity(Number(value ?? 0))}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
