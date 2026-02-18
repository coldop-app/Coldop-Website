import { memo, useMemo } from 'react';
import { Cell, Pie, PieChart } from 'recharts';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { QuantityType } from './types';

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'oklch(0.627 0.265 303.9)',
];

const QUANTITY_SUBTITLE: Record<QuantityType, string> = {
  current: 'Percentage breakdown by farmer (current stock)',
  initial: 'Percentage breakdown by farmer (initial / received)',
  outgoing: 'Percentage breakdown by farmer (outgoing / released)',
};

export interface FarmerWiseShareChartProps {
  /** { farmerName, value } with value > 0 */
  data: { name: string; value: number }[];
  quantityType: QuantityType;
}

const FarmerWiseShareChart = memo(function FarmerWiseShareChart({
  data,
  quantityType,
}: FarmerWiseShareChartProps) {
  const { pieData, chartConfig } = useMemo(() => {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    const slices = data.map((d, i) => ({
      name: d.name,
      value: d.value,
      fill: CHART_COLORS[i % CHART_COLORS.length],
      percentage: total > 0 ? (d.value / total) * 100 : 0,
    }));
    const config: ChartConfig = {};
    slices.forEach((s, i) => {
      config[s.name] = {
        label: s.name,
        color: CHART_COLORS[i % CHART_COLORS.length],
      };
    });
    return { pieData: slices, chartConfig: config };
  }, [data]);

  const total = useMemo(
    () => pieData.reduce((sum, d) => sum + d.value, 0),
    [pieData]
  );
  const topFarmer = pieData[0];

  if (pieData.length === 0) {
    return (
      <Card className="border-border min-w-0 w-full overflow-hidden rounded-xl shadow-sm">
        <CardHeader className="pb-2">
          <h3 className="font-custom text-foreground text-base font-semibold sm:text-lg">
            Farmer-wise Share
          </h3>
          <p className="font-custom text-muted-foreground text-xs sm:text-sm">
            {QUANTITY_SUBTITLE[quantityType]}
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
    <Card className="border-border min-w-0 w-full overflow-hidden rounded-xl shadow-sm">
      <CardHeader className="pb-2">
        <h3 className="font-custom text-foreground text-base font-semibold sm:text-lg">
          Farmer-wise Share
        </h3>
        <p className="font-custom text-muted-foreground text-xs sm:text-sm">
          {QUANTITY_SUBTITLE[quantityType]}
        </p>
      </CardHeader>
      <CardContent className="min-w-0 space-y-4 sm:space-y-6">
        <div className="min-h-[220px] w-full min-w-0 sm:h-[280px] md:mx-auto md:max-w-[320px]">
          <ChartContainer
            config={chartConfig}
            className="h-full min-h-[220px] w-full min-w-0 [&_.recharts-wrapper]:h-full! [&_.recharts-wrapper]:w-full! sm:min-h-0"
          >
            <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    nameKey="name"
                    formatter={(value) => [
                      `${Number(value).toLocaleString('en-IN')} (${total > 0 ? ((Number(value) / total) * 100).toFixed(1) : 0}%)`,
                      undefined,
                    ]}
                  />
                }
              />
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="90%"
                strokeWidth={0}
                paddingAngle={1}
              >
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>
        <div className="min-w-0 space-y-2">
          <div className="font-custom text-muted-foreground flex min-w-0 flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm">
            {pieData.map((item) => (
              <div key={item.name} className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.fill }}
                  aria-hidden
                />
                <span className="min-w-0 text-foreground">
                  {item.name}: {item.value.toLocaleString('en-IN')} (
                  {item.percentage.toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
          <div className="min-w-0 space-y-1">
            {topFarmer && (
              <p className="font-custom text-muted-foreground text-xs sm:text-sm">
                • {topFarmer.name} is the top contributor with{' '}
                {topFarmer.percentage.toFixed(1)}% of total inventory
              </p>
            )}
            <p className="font-custom text-muted-foreground text-xs sm:text-sm">
              • Total farmers: {pieData.length}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default FarmerWiseShareChart;
