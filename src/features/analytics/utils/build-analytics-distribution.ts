import type { ChartConfig } from '@/components/ui/chart';
import type { AnalyticsStockVariety } from '@/features/analytics/types';
import { getAnalyticsQuantityForMode } from '@/features/analytics/utils/get-analytics-quantity-for-mode';
import type { StockQuantityMode } from '@/features/people/utils/build-farmer-stock-summary';

export type DistributionItem = {
  key: string;
  label: string;
  bags: number;
  share: number;
  fill: string;
  shortLabel: string;
};

export type AnalyticsDistribution = {
  /** Grouped slices for the pie chart (small slices rolled into Others). */
  items: DistributionItem[];
  /** Full per-label breakdown for the summary table. */
  tableItems: DistributionItem[];
  total: number;
  chartConfig: ChartConfig;
};

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

function buildChartConfig(labels: string[]): { config: ChartConfig; keys: string[] } {
  const config: ChartConfig = {};
  const keys: string[] = [];

  labels.forEach((label, index) => {
    const key = toChartKey(label, index);
    const colorIndex = (index % CHART_COLOR_COUNT) + 1;

    keys.push(key);
    config[key] = {
      label,
      color: `var(--chart-${colorIndex})`,
    };
  });

  return { config, keys };
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

function toDistributionItem(
  entry: { label: string; bags: number },
  index: number,
  total: number,
  key: string,
): DistributionItem {
  const colorIndex = (index % CHART_COLOR_COUNT) + 1;

  return {
    key,
    label: entry.label,
    bags: entry.bags,
    share: (entry.bags / total) * 100,
    fill: `var(--chart-${colorIndex})`,
    shortLabel: entry.label.length > 16 ? `${entry.label.slice(0, 14).trim()}…` : entry.label,
  };
}

function toDistributionItems(
  entries: Array<{ label: string; bags: number }>,
): AnalyticsDistribution {
  const filtered = entries.filter((entry) => entry.bags > 0);
  const total = filtered.reduce((sum, entry) => sum + entry.bags, 0);

  if (total <= 0) {
    return { items: [], tableItems: [], total: 0, chartConfig: {} };
  }

  const sorted = [...filtered].sort((a, b) => {
    const bagDiff = b.bags - a.bags;
    if (bagDiff !== 0) return bagDiff;
    return a.label.localeCompare(b.label);
  });

  const grouped = clubSmallSlices(sorted, total);
  const { config, keys } = buildChartConfig(grouped.map((entry) => entry.label));

  const items: DistributionItem[] = grouped.map((entry, index) =>
    toDistributionItem(entry, index, total, keys[index]),
  );

  const chartItemByLabel = new Map(items.map((item) => [item.label, item]));
  const othersFill = chartItemByLabel.get(OTHERS_LABEL)?.fill;

  const tableLabels = sorted.map((entry) => entry.label);
  const { keys: tableKeys } = buildChartConfig(tableLabels);

  const tableItems: DistributionItem[] = sorted.map((entry, index) => {
    const fill =
      chartItemByLabel.get(entry.label)?.fill ??
      othersFill ??
      `var(--chart-${(index % CHART_COLOR_COUNT) + 1})`;

    return {
      ...toDistributionItem(entry, index, total, tableKeys[index]),
      fill,
    };
  });

  return { items, tableItems, total, chartConfig: config };
}

export function buildVarietyDistribution(
  stockSummary: AnalyticsStockVariety[],
  quantityMode: StockQuantityMode,
): AnalyticsDistribution {
  const varietyTotals = new Map<string, number>();

  for (const variety of stockSummary) {
    const varietyName = variety.variety.trim() || '—';
    let total = varietyTotals.get(varietyName) ?? 0;

    for (const size of variety.sizes) {
      total += getAnalyticsQuantityForMode(
        size.initialQuantity,
        size.currentQuantity,
        quantityMode,
      );
    }

    varietyTotals.set(varietyName, total);
  }

  return toDistributionItems(
    [...varietyTotals.entries()].map(([label, bags]) => ({ label, bags })),
  );
}

function resolveSizeOrder(stockSummary: AnalyticsStockVariety[], sizeOrder?: string[]): string[] {
  if (sizeOrder && sizeOrder.length > 0) {
    const seen = new Set(sizeOrder);
    const extra = new Set<string>();

    for (const variety of stockSummary) {
      for (const size of variety.sizes) {
        const name = size.size.trim();
        if (name && !seen.has(name)) extra.add(name);
      }
    }

    return [...sizeOrder, ...[...extra].sort((a, b) => a.localeCompare(b))];
  }

  const sizes = new Set<string>();
  for (const variety of stockSummary) {
    for (const size of variety.sizes) {
      const name = size.size.trim();
      if (name) sizes.add(name);
    }
  }

  return [...sizes].sort((a, b) => a.localeCompare(b));
}

export function buildSizeDistribution(
  stockSummary: AnalyticsStockVariety[],
  quantityMode: StockQuantityMode,
  sizeOrder?: string[],
): AnalyticsDistribution {
  const orderedSizes = resolveSizeOrder(stockSummary, sizeOrder);
  const sizeTotals = new Map<string, number>(orderedSizes.map((size) => [size, 0]));

  for (const variety of stockSummary) {
    for (const size of variety.sizes) {
      const sizeName = size.size.trim();
      if (!sizeName) continue;

      const quantity = getAnalyticsQuantityForMode(
        size.initialQuantity,
        size.currentQuantity,
        quantityMode,
      );

      sizeTotals.set(sizeName, (sizeTotals.get(sizeName) ?? 0) + quantity);
    }
  }

  return toDistributionItems(
    orderedSizes.map((label) => ({
      label,
      bags: sizeTotals.get(label) ?? 0,
    })),
  );
}
