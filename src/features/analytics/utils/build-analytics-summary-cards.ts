import type { AnalyticsSummaryData, AnalyticsTopFarmersResponse } from '@/features/analytics/types';
import type { StockQuantityMode } from '@/features/people/utils/build-farmer-stock-summary';

export type AnalyticsSummaryCard = {
  label: string;
  value: string;
  subtext: string;
  highlight?: boolean;
};

export type AnalyticsSummaryCards = {
  totalInventory: AnalyticsSummaryCard;
  topVariety: AnalyticsSummaryCard;
  topSize: AnalyticsSummaryCard;
  topFarmer: AnalyticsSummaryCard;
};

const MODE_LABELS: Record<StockQuantityMode, string> = {
  current: 'current',
  initial: 'initial',
  outgoing: 'outgoing',
};

function formatBagsSubtext(count: number): string {
  return `${count.toLocaleString('en-IN')} bags`;
}

function getTopVarietyByMode(
  summary: AnalyticsSummaryData,
  mode: StockQuantityMode,
): { name: string; quantity: number } | null {
  if (mode === 'current' && summary.topVariety) {
    return {
      name: summary.topVariety.variety,
      quantity: summary.topVariety.currentQuantity,
    };
  }

  let top: { name: string; quantity: number } | null = null;

  for (const variety of summary.stockSummary) {
    const varietyName = variety.variety.trim() || '—';
    let varietyTotal = 0;

    for (const size of variety.sizes) {
      const quantity =
        mode === 'initial'
          ? size.initialQuantity
          : Math.max(size.initialQuantity - size.currentQuantity, 0);
      varietyTotal += quantity;
    }

    if (!top || varietyTotal > top.quantity) {
      top = { name: varietyName, quantity: varietyTotal };
    }
  }

  return top && top.quantity > 0 ? top : null;
}

function getTopSizeByMode(
  summary: AnalyticsSummaryData,
  mode: StockQuantityMode,
): { name: string; quantity: number } | null {
  if (mode === 'current' && summary.topSize) {
    return {
      name: summary.topSize.size,
      quantity: summary.topSize.currentQuantity,
    };
  }

  const sizeTotals = new Map<string, number>();

  for (const variety of summary.stockSummary) {
    for (const size of variety.sizes) {
      const sizeName = size.size.trim();
      if (!sizeName) continue;

      const quantity =
        mode === 'initial'
          ? size.initialQuantity
          : Math.max(size.initialQuantity - size.currentQuantity, 0);

      sizeTotals.set(sizeName, (sizeTotals.get(sizeName) ?? 0) + quantity);
    }
  }

  let top: { name: string; quantity: number } | null = null;

  for (const [name, quantity] of sizeTotals) {
    if (!top || quantity > top.quantity) {
      top = { name, quantity };
    }
  }

  return top && top.quantity > 0 ? top : null;
}

function getTotalInventory(summary: AnalyticsSummaryData, mode: StockQuantityMode): number {
  switch (mode) {
    case 'current':
      return summary.totalInventory.current;
    case 'initial':
      return summary.totalInventory.initial;
    case 'outgoing':
      return Math.max(summary.totalInventory.initial - summary.totalInventory.current, 0);
  }
}

function getTopFarmer(
  topFarmers: AnalyticsTopFarmersResponse | null,
  mode: StockQuantityMode,
): { name: string; quantity: number } | null {
  if (!topFarmers?.data?.chartData) return null;

  const series =
    mode === 'current'
      ? topFarmers.data.chartData.byCurrentQuantity
      : mode === 'initial'
        ? topFarmers.data.chartData.byInitialQuantity
        : topFarmers.data.chartData.byQuantityRemoved;

  const top = series[0];
  if (!top || top.value <= 0) return null;

  return { name: top.name, quantity: top.value };
}

export function buildAnalyticsSummaryCards(
  summary: AnalyticsSummaryData,
  topFarmers: AnalyticsTopFarmersResponse | null,
  quantityMode: StockQuantityMode,
): AnalyticsSummaryCards {
  const modeLabel = MODE_LABELS[quantityMode];
  const totalCount = getTotalInventory(summary, quantityMode);
  const topVariety = getTopVarietyByMode(summary, quantityMode);
  const topSize = getTopSizeByMode(summary, quantityMode);
  const topFarmer = getTopFarmer(topFarmers, quantityMode);

  return {
    totalInventory: {
      label: `Total inventory (${modeLabel})`,
      value: totalCount.toLocaleString('en-IN'),
      subtext: quantityMode === 'outgoing' ? 'Bags dispatched' : 'Bags in storage',
      highlight: quantityMode === 'current',
    },
    topVariety: {
      label: 'Top variety',
      value: topVariety?.name ?? '—',
      subtext: topVariety ? formatBagsSubtext(topVariety.quantity) : 'No stock',
    },
    topSize: {
      label: 'Top bag size',
      value: topSize?.name ?? '—',
      subtext: topSize ? formatBagsSubtext(topSize.quantity) : 'No stock',
    },
    topFarmer: {
      label: 'Top farmer',
      value: topFarmer?.name ?? '—',
      subtext: topFarmer ? formatBagsSubtext(topFarmer.quantity) : 'No stock',
    },
  };
}
