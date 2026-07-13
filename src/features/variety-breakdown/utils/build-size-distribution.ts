import type { ChartConfig } from '@/components/ui/chart';
import type {
  AnalyticsDistribution,
  DistributionItem,
} from '@/features/analytics/utils/build-analytics-distribution';
import type { StockQuantityMode } from '@/features/people/utils/build-farmer-stock-summary';

import type { VarietyBreakdownSize } from '../types';
import { getSizeQuantityForMode } from './get-variety-breakdown-quantity';

const CHART_COLOR_COUNT = 16;

function toChartKey(label: string, index: number): string {
  const base =
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'item';

  return `${base}-${index}`;
}

export type SizeBarItem = {
  key: string;
  label: string;
  bags: number;
  share: number;
  fill: string;
  isSelected: boolean;
};

export type SizeDistributionChart = {
  items: SizeBarItem[];
  total: number;
  chartConfig: ChartConfig;
};

export function buildSizeDistribution(
  orderedSizes: string[],
  apiSizes: VarietyBreakdownSize[],
  quantityMode: StockQuantityMode,
  selectedBagSize: string,
): SizeDistributionChart {
  const apiSizeMap = new Map(apiSizes.map((size) => [size.size, size]));

  const entries = orderedSizes.map((label) => {
    const apiSize = apiSizeMap.get(label);

    return {
      label,
      bags: apiSize ? getSizeQuantityForMode(apiSize, quantityMode) : 0,
    };
  });

  const filtered = entries.filter((entry) => entry.bags > 0);
  const total = filtered.reduce((sum, entry) => sum + entry.bags, 0);

  if (total <= 0) {
    return { items: [], total: 0, chartConfig: {} };
  }

  const sorted = [...filtered].sort((a, b) => {
    const bagDiff = b.bags - a.bags;
    if (bagDiff !== 0) return bagDiff;
    return a.label.localeCompare(b.label);
  });

  const config: ChartConfig = {};
  const items: SizeBarItem[] = sorted.map((entry, index) => {
    const key = toChartKey(entry.label, index);
    const isSelected = entry.label === selectedBagSize;
    const colorIndex = (index % CHART_COLOR_COUNT) + 1;

    config[key] = {
      label: entry.label,
      color: isSelected ? 'var(--primary)' : `var(--chart-${colorIndex})`,
    };

    return {
      key,
      label: entry.label,
      bags: entry.bags,
      share: (entry.bags / total) * 100,
      fill: isSelected ? 'var(--primary)' : `var(--chart-${colorIndex})`,
      isSelected,
    };
  });

  return { items, total, chartConfig: config };
}

export function buildSizeDistributionForPanel(
  orderedSizes: string[],
  apiSizes: VarietyBreakdownSize[],
  quantityMode: StockQuantityMode,
): AnalyticsDistribution {
  const chart = buildSizeDistribution(orderedSizes, apiSizes, quantityMode, '');

  const tableItems: DistributionItem[] = chart.items.map((item) => ({
    key: item.key,
    label: item.label,
    bags: item.bags,
    share: item.share,
    fill: item.fill,
    shortLabel: item.label.length > 16 ? `${item.label.slice(0, 14).trim()}…` : item.label,
  }));

  return {
    items: tableItems,
    tableItems,
    total: chart.total,
    chartConfig: chart.chartConfig,
  };
}
