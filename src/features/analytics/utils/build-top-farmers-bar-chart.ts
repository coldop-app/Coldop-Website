import type { ChartConfig } from '@/components/ui/chart';
import type {
  AnalyticsTopFarmerPoint,
  AnalyticsTopFarmersResponse,
} from '@/features/analytics/types';
import type { StockQuantityMode } from '@/features/people/utils/build-farmer-stock-summary';

export type TopFarmerBarItem = {
  key: string;
  label: string;
  bags: number;
  fill: string;
};

export type TopFarmersBarChart = {
  items: TopFarmerBarItem[];
  chartConfig: ChartConfig;
};

const PRIMARY_BAR_FILL = 'var(--primary)';

function toChartKey(label: string, index: number): string {
  const base =
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'farmer';

  return `${base}-${index}`;
}

function getTopFarmerSeries(
  response: AnalyticsTopFarmersResponse | null,
  quantityMode: StockQuantityMode,
): AnalyticsTopFarmerPoint[] {
  if (!response?.data?.chartData) return [];

  const { chartData } = response.data;

  switch (quantityMode) {
    case 'current':
      return chartData.byCurrentQuantity;
    case 'initial':
      return chartData.byInitialQuantity;
    case 'outgoing':
      return chartData.byQuantityRemoved;
  }
}

export function buildTopFarmersBarChart(
  response: AnalyticsTopFarmersResponse | null,
  quantityMode: StockQuantityMode,
): TopFarmersBarChart {
  const points = getTopFarmerSeries(response, quantityMode)
    .filter((point) => point.value > 0)
    .sort((a, b) => {
      const valueDiff = b.value - a.value;
      if (valueDiff !== 0) return valueDiff;
      return a.name.localeCompare(b.name);
    });

  const chartConfig: ChartConfig = {
    bags: {
      label: 'Bags',
      color: PRIMARY_BAR_FILL,
    },
    label: {
      color: 'var(--primary-foreground)',
    },
  };

  if (points.length === 0) {
    return { items: [], chartConfig };
  }

  const items: TopFarmerBarItem[] = points.map((point, index) => {
    const key = toChartKey(point.name, index);

    chartConfig[key] = {
      label: point.name,
    };

    return {
      key,
      label: point.name,
      bags: point.value,
      fill: PRIMARY_BAR_FILL,
    };
  });

  return { items, chartConfig };
}
