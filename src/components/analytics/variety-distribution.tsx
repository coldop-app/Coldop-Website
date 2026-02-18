import { memo, useMemo } from 'react';
import { Cell, Pie, PieChart } from 'recharts';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { VarietyStockSummary } from '@/services/analytics/useGetStorageSummary';

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'oklch(0.627 0.265 303.9)', // 6th for dark/light
];

export type VarietyQuantityType = 'current' | 'initial' | 'outgoing';

const QUANTITY_TYPE_SUBTITLE: Record<VarietyQuantityType, string> = {
  current: 'Percentage breakdown by potato variety (current stock)',
  initial: 'Percentage breakdown by potato variety (initial / received)',
  outgoing: 'Percentage breakdown by potato variety (outgoing / released)',
};

export interface VarietyDistributionProps {
  /** Stock summary by variety and size */
  stockSummary: VarietyStockSummary[];
  /** Which quantity to show: current, initial, or outgoing */
  quantityType?: VarietyQuantityType;
}

interface VarietySlice {
  name: string;
  value: number;
  fill: string;
  percentage: number;
}

function getQuantityForMode(
  sizes: { initialQuantity: number; currentQuantity: number }[],
  mode: VarietyQuantityType
): number {
  if (mode === 'current') {
    return sizes.reduce((sum, s) => sum + s.currentQuantity, 0);
  }
  if (mode === 'initial') {
    return sizes.reduce((sum, s) => sum + s.initialQuantity, 0);
  }
  return sizes.reduce(
    (sum, s) => sum + Math.max(0, s.initialQuantity - s.currentQuantity),
    0
  );
}

const VarietyDistribution = memo(function VarietyDistribution({
  stockSummary,
  quantityType = 'current',
}: VarietyDistributionProps) {
  const { pieData, chartConfig } = useMemo(() => {
    const slices: VarietySlice[] = [];
    let total = 0;

    for (let i = 0; i < stockSummary.length; i++) {
      const row = stockSummary[i];
      const value = getQuantityForMode(row.sizes, quantityType);
      if (value <= 0) continue;
      const color = CHART_COLORS[i % CHART_COLORS.length];
      slices.push({
        name: row.variety,
        value,
        fill: color,
        percentage: 0,
      });
      total += value;
    }

    const withPercentage = slices.map((s) => ({
      ...s,
      percentage: total > 0 ? (s.value / total) * 100 : 0,
    }));

    const config: ChartConfig = {};
    withPercentage.forEach((s, i) => {
      config[s.name] = {
        label: s.name,
        color: CHART_COLORS[i % CHART_COLORS.length],
      };
    });

    return {
      pieData: withPercentage,
      chartConfig: config,
    };
  }, [stockSummary, quantityType]);

  if (pieData.length === 0) {
    return (
      <Card className="border-border min-w-0 w-full overflow-hidden rounded-xl shadow-sm">
        <CardHeader className="pb-2">
          <h3 className="font-custom text-foreground text-base font-semibold sm:text-lg">
            Variety Distribution
          </h3>
          <p className="font-custom text-muted-foreground text-xs">
            {QUANTITY_TYPE_SUBTITLE[quantityType]}
          </p>
        </CardHeader>
        <CardContent>
          <p className="font-custom text-muted-foreground text-sm">
            No variety data for this selection.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border min-w-0 w-full overflow-hidden rounded-xl shadow-sm">
      <CardHeader className="pb-2">
        <h3 className="font-custom text-foreground text-base font-semibold sm:text-lg">
          Variety Distribution
        </h3>
        <p className="font-custom text-muted-foreground text-xs sm:text-sm">
          {QUANTITY_TYPE_SUBTITLE[quantityType]}
        </p>
      </CardHeader>
      <CardContent className="min-w-0 space-y-4 sm:space-y-6">
        <div className="min-h-[220px] w-full min-w-0 sm:h-[280px] md:mx-auto md:max-w-[400px]">
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
                      `${Number(value).toLocaleString('en-IN')} bags`,
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
                innerRadius={0}
                strokeWidth={0}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(1)}%`
                }
                labelLine={{ stroke: 'var(--border)' }}
              >
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>

        <div className="min-w-0 space-y-2">
          <h4 className="font-custom text-foreground text-sm font-semibold sm:text-base">
            Variety Distribution & Insights
          </h4>
          <ul className="font-custom text-muted-foreground grid grid-cols-1 gap-1.5 text-xs sm:grid-cols-2 sm:text-sm lg:grid-cols-3">
            {pieData.map((item) => (
              <li
                key={item.name}
                className="flex min-w-0 items-center gap-2"
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.fill }}
                  aria-hidden
                />
                <span className="min-w-0 text-foreground">
                  {item.name}: {item.value.toLocaleString('en-IN')} bags (
                  {item.percentage.toFixed(1)}%)
                </span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
});

export default VarietyDistribution;
