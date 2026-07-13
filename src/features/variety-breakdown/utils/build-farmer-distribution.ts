import type { AnalyticsDistribution } from '@/features/analytics/utils/build-analytics-distribution';
import type { StockQuantityMode } from '@/features/people/utils/build-farmer-stock-summary';

import type { VarietyBreakdownFarmer } from '../types';
import { getFarmerQuantityForMode } from './get-variety-breakdown-quantity';

const CHART_COLOR_COUNT = 16;
const SMALL_SLICE_THRESHOLD_PERCENT = 2;
const OTHERS_LABEL = 'Others';

function toChartKey(label: string, index: number): string {
  const base =
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'item';

  return `${base}-${index}`;
}

function clubSmallSlices(
  entries: Array<{ label: string; bags: number }>,
  total: number,
): Array<{ label: string; bags: number }> {
  const main: Array<{ label: string; bags: number }> = [];
  let othersBags = 0;

  for (const entry of entries) {
    const share = (entry.bags / total) * 100;

    if (share < SMALL_SLICE_THRESHOLD_PERCENT) {
      othersBags += entry.bags;
    } else {
      main.push(entry);
    }
  }

  if (othersBags <= 0) {
    return main;
  }

  return [...main, { label: OTHERS_LABEL, bags: othersBags }];
}

export function buildFarmerDistribution(
  farmers: VarietyBreakdownFarmer[],
  quantityMode: StockQuantityMode,
): AnalyticsDistribution {
  const entries = farmers
    .map((farmer) => ({
      label: farmer.farmerName.trim() || '—',
      bags: getFarmerQuantityForMode(farmer, quantityMode),
    }))
    .filter((entry) => entry.bags > 0);

  const total = entries.reduce((sum, entry) => sum + entry.bags, 0);

  if (total <= 0) {
    return { items: [], tableItems: [], total: 0, chartConfig: {} };
  }

  const sorted = [...entries].sort((a, b) => {
    const bagDiff = b.bags - a.bags;
    if (bagDiff !== 0) return bagDiff;
    return a.label.localeCompare(b.label);
  });

  const grouped = clubSmallSlices(sorted, total);
  const chartConfig: AnalyticsDistribution['chartConfig'] = {};
  const groupedKeys: string[] = [];

  grouped.forEach((entry, index) => {
    const key = toChartKey(entry.label, index);
    const colorIndex = (index % CHART_COLOR_COUNT) + 1;

    groupedKeys.push(key);
    chartConfig[key] = {
      label: entry.label,
      color: `var(--chart-${colorIndex})`,
    };
  });

  const items = grouped.map((entry, index) => {
    const colorIndex = (index % CHART_COLOR_COUNT) + 1;

    return {
      key: groupedKeys[index],
      label: entry.label,
      bags: entry.bags,
      share: (entry.bags / total) * 100,
      fill: `var(--chart-${colorIndex})`,
      shortLabel: entry.label.length > 16 ? `${entry.label.slice(0, 14).trim()}…` : entry.label,
    };
  });

  const chartItemByLabel = new Map(items.map((item) => [item.label, item]));
  const othersFill = chartItemByLabel.get(OTHERS_LABEL)?.fill;

  const tableItems = sorted.map((entry, index) => {
    const colorIndex = (index % CHART_COLOR_COUNT) + 1;
    const fill =
      chartItemByLabel.get(entry.label)?.fill ?? othersFill ?? `var(--chart-${colorIndex})`;

    return {
      key: toChartKey(entry.label, index),
      label: entry.label,
      bags: entry.bags,
      share: (entry.bags / total) * 100,
      fill,
      shortLabel: entry.label.length > 16 ? `${entry.label.slice(0, 14).trim()}…` : entry.label,
    };
  });

  return { items, tableItems, total, chartConfig };
}

export type FarmerTableRow = {
  farmerName: string;
  bags: number;
  share: number;
};

export function buildFarmerTableRows(
  farmers: VarietyBreakdownFarmer[],
  quantityMode: StockQuantityMode,
): FarmerTableRow[] {
  const entries = farmers
    .map((farmer) => ({
      farmerName: farmer.farmerName.trim() || '—',
      bags: getFarmerQuantityForMode(farmer, quantityMode),
    }))
    .filter((entry) => entry.bags > 0);

  const total = entries.reduce((sum, entry) => sum + entry.bags, 0);

  if (total <= 0) {
    return [];
  }

  return [...entries]
    .sort((a, b) => {
      const bagDiff = b.bags - a.bags;
      if (bagDiff !== 0) return bagDiff;
      return a.farmerName.localeCompare(b.farmerName);
    })
    .map((entry) => ({
      ...entry,
      share: (entry.bags / total) * 100,
    }));
}
