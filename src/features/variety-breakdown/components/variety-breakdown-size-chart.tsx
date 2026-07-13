import { useMemo } from 'react';
import { Layers } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { formatQuantity } from '@/features/daybook/utils/format';
import type { StockQuantityMode } from '@/features/people/utils/build-farmer-stock-summary';
import { useIsMobile } from '@/hooks/use-mobile';

import { buildDominantItemInsight, buildTotalInsight } from '../utils/build-distribution-insights';
import type { SizeDistributionChart } from '../utils/build-size-distribution';
import { VarietyBreakdownInsights } from './variety-breakdown-insights';

const QUANTITY_MODE_SUBTITLES: Record<StockQuantityMode, string> = {
  current: 'Aggregate quantities by size (current stock)',
  initial: 'Aggregate quantities by size (initial stock)',
  outgoing: 'Aggregate quantities by size (outgoing stock)',
};

const DESKTOP_BAR_LAYOUT = {
  barSize: 42,
  rowHeight: 68,
  categoryGap: 22,
  minHeight: 220,
} as const;

const MOBILE_BAR_LAYOUT = {
  barSize: 32,
  rowHeight: 58,
  categoryGap: 22,
  minHeight: 180,
} as const;

function truncateLabel(label: string, maxLength = 24): string {
  if (label.length <= maxLength) return label;
  return `${label.slice(0, maxLength - 1).trim()}…`;
}

type VarietyBreakdownSizeChartProps = {
  distribution: SizeDistributionChart;
  quantityMode: StockQuantityMode;
};

export function VarietyBreakdownSizeChart({
  distribution,
  quantityMode,
}: VarietyBreakdownSizeChartProps) {
  const isMobile = useIsMobile();
  const barLayout = isMobile ? MOBILE_BAR_LAYOUT : DESKTOP_BAR_LAYOUT;
  const { items, total, chartConfig } = distribution;

  const chartHeight = Math.max(items.length * barLayout.rowHeight, barLayout.minHeight);

  const maxValueLabelWidth = useMemo(() => {
    const widest = items.reduce((max, item) => Math.max(max, formatQuantity(item.bags).length), 0);
    return Math.max(widest * 8 + 16, 48);
  }, [items]);

  const insights = useMemo(() => {
    const dominant = buildDominantItemInsight(items, 'size');
    const totalInsight = buildTotalInsight(total, 'sizes');

    return [dominant, totalInsight].filter(
      (insight): insight is NonNullable<typeof insight> => insight !== null,
    );
  }, [items, total]);

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-2 text-base font-semibold">
          <Layers className="text-primary size-5" aria-hidden />
          Size-wise distribution
        </CardTitle>
        <CardDescription>{QUANTITY_MODE_SUBTITLES[quantityMode]}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm">No size data for this view.</p>
        ) : (
          <>
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
                <YAxis dataKey="key" type="category" tickLine={false} axisLine={false} hide />
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
                        const size = item.payload as (typeof items)[number];

                        return (
                          <div className="flex w-full flex-col gap-0.5 text-xs">
                            <span className="text-foreground font-medium">{size.label}</span>
                            <span className="text-foreground tabular-nums">
                              {formatQuantity(Number(value))} bags
                            </span>
                          </div>
                        );
                      }}
                    />
                  }
                />
                <Bar dataKey="bags" radius={4} barSize={barLayout.barSize}>
                  {items.map((entry) => (
                    <Cell key={entry.key} fill={entry.fill} />
                  ))}
                  <LabelList
                    dataKey="label"
                    position="insideLeft"
                    offset={8}
                    className="fill-foreground"
                    fontSize={12}
                    formatter={(value) => truncateLabel(String(value ?? ''))}
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

            <VarietyBreakdownInsights insights={insights} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
