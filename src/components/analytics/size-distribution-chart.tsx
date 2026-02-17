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

export type SizeQuantityType = 'current' | 'initial' | 'outgoing';

const QUANTITY_TYPE_SUBTITLE: Record<SizeQuantityType, string> = {
  current: 'Percentage breakdown by bag size (current stock)',
  initial: 'Percentage breakdown by bag size (initial / received)',
  outgoing: 'Percentage breakdown by bag size (outgoing / released)',
};

export interface SizeDistributionChartProps {
  /** Stock summary by variety and size */
  stockSummary: VarietyStockSummary[];
  /** Which quantity to show: current, initial, or outgoing */
  quantityType?: SizeQuantityType;
}

interface SizeSlice {
  name: string;
  value: number;
  fill: string;
  percentage: number;
}

function getQuantityForMode(
  initialQuantity: number,
  currentQuantity: number,
  mode: SizeQuantityType
): number {
  if (mode === 'current') return currentQuantity;
  if (mode === 'initial') return initialQuantity;
  return Math.max(0, initialQuantity - currentQuantity);
}

const SizeDistributionChart = memo(function SizeDistributionChart({
  stockSummary,
  quantityType = 'current',
}: SizeDistributionChartProps) {
  const { pieData, chartConfig } = useMemo(() => {
    const bySize = new Map<string, number>();

    for (const row of stockSummary) {
      for (const s of row.sizes) {
        const value = getQuantityForMode(
          s.initialQuantity,
          s.currentQuantity,
          quantityType
        );
        if (value <= 0) continue;
        const key = (s.size ?? '').trim() || '—';
        bySize.set(key, (bySize.get(key) ?? 0) + value);
      }
    }

    const sizes = Array.from(bySize.entries())
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1]);

    const total = sizes.reduce((sum, [, v]) => sum + v, 0);
    const slices: SizeSlice[] = sizes.map(([name], i) => ({
      name,
      value: sizes[i][1],
      fill: CHART_COLORS[i % CHART_COLORS.length],
      percentage: total > 0 ? (sizes[i][1] / total) * 100 : 0,
    }));

    const config: ChartConfig = {};
    slices.forEach((s, i) => {
      config[s.name] = {
        label: s.name,
        color: CHART_COLORS[i % CHART_COLORS.length],
      };
    });

    return {
      pieData: slices,
      chartConfig: config,
    };
  }, [stockSummary, quantityType]);

  if (pieData.length === 0) {
    return (
      <Card className="border-border rounded-xl shadow-sm">
        <CardHeader className="pb-2">
          <h3 className="font-custom text-foreground text-base font-semibold sm:text-lg">
            Size Distribution
          </h3>
          <p className="font-custom text-muted-foreground text-xs">
            {QUANTITY_TYPE_SUBTITLE[quantityType]}
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
    <Card className="border-border rounded-xl shadow-sm">
      <CardHeader className="pb-2">
        <h3 className="font-custom text-foreground text-base font-semibold sm:text-lg">
          Size Distribution
        </h3>
        <p className="font-custom text-muted-foreground text-xs">
          {QUANTITY_TYPE_SUBTITLE[quantityType]}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="mx-auto aspect-square min-h-[200px] w-full max-w-[min(400px,100%)] sm:min-h-[260px] lg:min-h-[280px]">
          <ChartContainer
            config={chartConfig}
            className="h-full min-h-0 w-full [&_.recharts-wrapper]:h-full! [&_.recharts-wrapper]:w-full!"
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

        <div className="space-y-2">
          <h4 className="font-custom text-foreground text-sm font-semibold">
            Size Distribution & Insights
          </h4>
          <ul className="font-custom text-muted-foreground grid grid-cols-1 gap-1.5 text-sm sm:grid-cols-2">
            {pieData.map((item) => (
              <li key={item.name} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.fill }}
                  aria-hidden
                />
                <span className="text-foreground">
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

export default SizeDistributionChart;
