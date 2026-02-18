import { memo, useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  useGetTopFarmers,
  type TopFarmersChartData,
  type TopFarmersDataPoint,
} from '@/services/analytics/useGetTopFarmers';

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

export type TopFarmersQuantityType = 'current' | 'initial' | 'outgoing';

const QUANTITY_TYPE_SUBTITLE: Record<TopFarmersQuantityType, string> = {
  current: 'Top 5 farmers by current quantity in storage',
  initial: 'Top 5 farmers by initial quantity received',
  outgoing: 'Top 5 farmers by quantity removed / released',
};

function getSeriesForMode(
  chartData: TopFarmersChartData | undefined,
  quantityType: TopFarmersQuantityType
): TopFarmersDataPoint[] {
  if (!chartData) return [];
  if (quantityType === 'current') return chartData.byCurrentQuantity;
  if (quantityType === 'initial') return chartData.byInitialQuantity;
  return chartData.byQuantityRemoved;
}

export interface TopFarmersChartProps {
  /** Which quantity to show: current, initial, or outgoing (matches analytics tab) */
  quantityType: TopFarmersQuantityType;
}

const TopFarmersChart = memo(function TopFarmersChart({
  quantityType,
}: TopFarmersChartProps) {
  const { data, isLoading, error } = useGetTopFarmers();
  const seriesData = useMemo(
    () => getSeriesForMode(data, quantityType),
    [data, quantityType]
  );

  const chartConfig: ChartConfig = useMemo(() => {
    const config: ChartConfig = {
      name: { label: 'Farmer', color: 'var(--foreground)' },
      value: { label: 'Bags', color: 'var(--chart-1)' },
    };
    seriesData.forEach((point, i) => {
      config[point.name] = {
        label: point.name,
        color: CHART_COLORS[i % CHART_COLORS.length],
      };
    });
    return config;
  }, [seriesData]);

  if (isLoading) {
    return (
      <Card className="border-border rounded-xl shadow-sm">
        <CardHeader className="pb-2">
          <h3 className="font-custom text-foreground text-base font-semibold sm:text-lg">
            Top Farmers
          </h3>
          <p className="font-custom text-muted-foreground text-xs">
            {QUANTITY_TYPE_SUBTITLE[quantityType]}
          </p>
        </CardHeader>
        <CardContent>
          <p className="font-custom text-muted-foreground text-sm">
            Loading top farmers…
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-border rounded-xl shadow-sm">
        <CardHeader className="pb-2">
          <h3 className="font-custom text-foreground text-base font-semibold sm:text-lg">
            Top Farmers
          </h3>
          <p className="font-custom text-muted-foreground text-xs">
            {QUANTITY_TYPE_SUBTITLE[quantityType]}
          </p>
        </CardHeader>
        <CardContent>
          <p className="font-custom text-destructive text-sm">
            {error instanceof Error ? error.message : 'Failed to load top farmers'}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!seriesData.length) {
    return (
      <Card className="border-border rounded-xl shadow-sm">
        <CardHeader className="pb-2">
          <h3 className="font-custom text-foreground text-base font-semibold sm:text-lg">
            Top Farmers
          </h3>
          <p className="font-custom text-muted-foreground text-xs">
            {QUANTITY_TYPE_SUBTITLE[quantityType]}
          </p>
        </CardHeader>
        <CardContent>
          <p className="font-custom text-muted-foreground text-sm">
            No farmer data for this selection.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border rounded-xl shadow-sm">
      <CardHeader className="pb-2">
        <h3 className="font-custom text-foreground text-base font-semibold sm:text-lg">
          Top Farmers
        </h3>
        <p className="font-custom text-muted-foreground text-xs">
          {QUANTITY_TYPE_SUBTITLE[quantityType]}
        </p>
      </CardHeader>
      <CardContent>
        <div className="mx-auto h-[260px] w-full sm:h-[280px]">
          <ChartContainer
            config={chartConfig}
            className="h-full w-full [&_.recharts-wrapper]:h-full! [&_.recharts-wrapper]:w-full!"
          >
            <BarChart
              data={seriesData}
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
      </CardContent>
    </Card>
  );
});

export default TopFarmersChart;
