import { memo, useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { QuantityType } from './types';

const QUANTITY_SUBTITLE: Record<QuantityType, string> = {
  current: 'Aggregate quantities by size (current stock)',
  initial: 'Aggregate quantities by size (initial / received)',
  outgoing: 'Aggregate quantities by size (outgoing / released)',
};

export interface SizeWiseDistributionChartProps {
  /** { sizeName, quantity } sorted by value desc */
  data: { name: string; value: number }[];
  quantityType: QuantityType;
}

const SizeWiseDistributionChart = memo(function SizeWiseDistributionChart({
  data,
  quantityType,
}: SizeWiseDistributionChartProps) {
  const chartConfig: ChartConfig = useMemo(() => {
    const config: ChartConfig = {
      name: { label: 'Size', color: 'var(--foreground)' },
      value: { label: 'Bags', color: 'var(--chart-1)' },
    };
    data.forEach((_, i) => {
      config[data[i].name] = {
        label: data[i].name,
        color: 'var(--chart-1)',
      };
    });
    return config;
  }, [data]);

  const total = useMemo(
    () => data.reduce((sum, d) => sum + d.value, 0),
    [data]
  );
  const topSize = data[0];
  const topPercentage =
    total > 0 && topSize ? ((topSize.value / total) * 100).toFixed(1) : null;

  if (data.length === 0) {
    return (
      <Card className="border-border min-w-0 w-full overflow-hidden rounded-xl shadow-sm">
        <CardHeader className="pb-2">
          <h3 className="font-custom text-foreground text-base font-semibold sm:text-lg">
            Size-wise Distribution
          </h3>
          <p className="font-custom text-muted-foreground text-xs sm:text-sm">
            {QUANTITY_SUBTITLE[quantityType]}
          </p>
        </CardHeader>
        <CardContent>
          <p className="font-custom text-muted-foreground text-sm">
            No size data for this selection.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border min-w-0 w-full overflow-hidden rounded-xl shadow-sm">
      <CardHeader className="pb-2">
        <h3 className="font-custom text-foreground text-base font-semibold sm:text-lg">
          Size-wise Distribution
        </h3>
        <p className="font-custom text-muted-foreground text-xs sm:text-sm">
          {QUANTITY_SUBTITLE[quantityType]}
        </p>
      </CardHeader>
      <CardContent className="min-w-0 space-y-4 sm:space-y-6">
        <div className="min-h-[220px] w-full min-w-0 sm:h-[280px]">
          <ChartContainer
            config={chartConfig}
            className="h-full min-h-[220px] w-full min-w-0 [&_.recharts-wrapper]:h-full! [&_.recharts-wrapper]:w-full! sm:min-h-0"
          >
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 4, right: 16, bottom: 4, left: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis type="number" dataKey="value" tickLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={80}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    nameKey="name"
                    formatter={(value) => [
                      `${Number(value).toLocaleString('en-IN')} bags`,
                      undefined,
                    ]}
                  />
                }
              />
              <Bar
                dataKey="value"
                fill="var(--chart-1)"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ChartContainer>
        </div>
        <div className="min-w-0 space-y-1">
          <p className="font-custom text-muted-foreground text-xs sm:text-sm">
            {topPercentage != null && topSize && (
              <>
                • {topSize.name} is the most stored size at {topPercentage}% of
                all inventory
              </>
            )}
          </p>
          <p className="font-custom text-muted-foreground text-xs sm:text-sm">
            • Total quantity across all sizes:{' '}
            {total.toLocaleString('en-IN')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
});

export default SizeWiseDistributionChart;
