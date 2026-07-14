import type {
  AnalyticsChartData,
  AnalyticsFlatSeriesPoint,
  AnalyticsStockFilterBucket,
  AnalyticsStockSize,
  AnalyticsStockVariety,
  AnalyticsSummaryByFilterData,
  AnalyticsSummaryData,
  AnalyticsTopSize,
  AnalyticsTopVariety,
} from '@/features/analytics/types';
import type { StockFilterTab } from '@/features/people/utils/build-farmer-stock-summary';

/** Normalized stock-filter option key (matches dynamic API `stockSummaryByFilter` keys). */
export type AnalyticsStockFilterBucketKey = string;

export function isAnalyticsSummaryByFilterData(
  data: AnalyticsSummaryData | AnalyticsSummaryByFilterData,
): data is AnalyticsSummaryByFilterData {
  return 'stockSummaryByFilter' in data;
}

export function mapStockFilterOptionToBucketKey(option: string): AnalyticsStockFilterBucketKey | null {
  const trimmed = option.trim();
  if (!trimmed || trimmed.toLowerCase() === 'all') return null;
  return trimmed;
}

function findStockFilterBucket(
  byFilter: Record<string, AnalyticsStockFilterBucket>,
  stockFilterTab: string,
): AnalyticsStockFilterBucket | null {
  const exact = byFilter[stockFilterTab];
  if (exact) return exact;

  const normalized = stockFilterTab.trim().toUpperCase();
  for (const [key, bucket] of Object.entries(byFilter)) {
    if (key.trim().toUpperCase() === normalized) return bucket;
  }

  return null;
}

export function bucketToAnalyticsSummaryData(
  bucket: AnalyticsStockFilterBucket,
): AnalyticsSummaryData {
  return {
    stockSummary: bucket.stockSummary,
    chartData: bucket.chartData,
    totalInventory: bucket.totalInventory,
    topVariety: bucket.topVariety,
    topSize: bucket.topSize,
  };
}

function mergeStockSizes(sizesList: AnalyticsStockSize[][]): AnalyticsStockSize[] {
  const bySize = new Map<string, AnalyticsStockSize>();

  for (const sizes of sizesList) {
    for (const entry of sizes) {
      const existing = bySize.get(entry.size);
      if (!existing) {
        bySize.set(entry.size, { ...entry });
        continue;
      }

      existing.initialQuantity += entry.initialQuantity;
      existing.currentQuantity += entry.currentQuantity;
    }
  }

  return Array.from(bySize.values());
}

function mergeStockSummaries(buckets: AnalyticsStockFilterBucket[]): AnalyticsStockVariety[] {
  const byVariety = new Map<string, AnalyticsStockSize[][]>();

  for (const bucket of buckets) {
    for (const variety of bucket.stockSummary) {
      const existing = byVariety.get(variety.variety);
      if (!existing) {
        byVariety.set(variety.variety, [variety.sizes]);
        continue;
      }
      existing.push(variety.sizes);
    }
  }

  return Array.from(byVariety.entries()).map(([variety, sizesList]) => ({
    variety,
    sizes: mergeStockSizes(sizesList),
  }));
}

function mergeFlatSeries(buckets: AnalyticsStockFilterBucket[]): AnalyticsFlatSeriesPoint[] {
  const byKey = new Map<string, AnalyticsFlatSeriesPoint>();

  for (const bucket of buckets) {
    for (const point of bucket.chartData.flatSeries) {
      const key = `${point.variety}::${point.size}`;
      const existing = byKey.get(key);
      if (!existing) {
        byKey.set(key, { ...point });
        continue;
      }

      existing.initialQuantity += point.initialQuantity;
      existing.currentQuantity += point.currentQuantity;
    }
  }

  return Array.from(byKey.values());
}

function mergeChartData(buckets: AnalyticsStockFilterBucket[]): AnalyticsChartData {
  const varieties = new Set<string>();
  const sizes = new Set<string>();

  for (const bucket of buckets) {
    for (const variety of bucket.chartData.varieties) {
      varieties.add(variety);
    }
    for (const size of bucket.chartData.sizes) {
      sizes.add(size);
    }
  }

  return {
    flatSeries: mergeFlatSeries(buckets),
    varieties: Array.from(varieties),
    sizes: Array.from(sizes),
  };
}

function computeTopVariety(stockSummary: AnalyticsStockVariety[]): AnalyticsTopVariety | null {
  let top: AnalyticsTopVariety | null = null;

  for (const variety of stockSummary) {
    const currentQuantity = variety.sizes.reduce((sum, size) => sum + size.currentQuantity, 0);
    if (!top || currentQuantity > top.currentQuantity) {
      top = { variety: variety.variety, currentQuantity };
    }
  }

  return top;
}

function computeTopSize(stockSummary: AnalyticsStockVariety[]): AnalyticsTopSize | null {
  const bySize = new Map<string, number>();

  for (const variety of stockSummary) {
    for (const size of variety.sizes) {
      bySize.set(size.size, (bySize.get(size.size) ?? 0) + size.currentQuantity);
    }
  }

  let top: AnalyticsTopSize | null = null;
  for (const [size, currentQuantity] of bySize) {
    if (!top || currentQuantity > top.currentQuantity) {
      top = { size, currentQuantity };
    }
  }

  return top;
}

export function mergeAnalyticsFilterBuckets(
  data: AnalyticsSummaryByFilterData,
): AnalyticsSummaryData {
  const buckets = Object.values(data.stockSummaryByFilter).filter(Boolean);
  const stockSummary = mergeStockSummaries(buckets);

  return {
    stockSummary,
    chartData: mergeChartData(buckets),
    totalInventory: {
      initial: buckets.reduce((sum, bucket) => sum + bucket.totalInventory.initial, 0),
      current: buckets.reduce((sum, bucket) => sum + bucket.totalInventory.current, 0),
    },
    topVariety: computeTopVariety(stockSummary),
    topSize: computeTopSize(stockSummary),
  };
}

export function resolveAnalyticsSummaryData(
  data: AnalyticsSummaryData | AnalyticsSummaryByFilterData | null | undefined,
  stockFilterTab: StockFilterTab,
  showStockFilterTabs: boolean,
): AnalyticsSummaryData | null {
  if (!data) return null;

  if (!showStockFilterTabs) {
    return isAnalyticsSummaryByFilterData(data) ? null : data;
  }

  if (!isAnalyticsSummaryByFilterData(data)) return null;

  if (stockFilterTab === 'all') {
    return mergeAnalyticsFilterBuckets(data);
  }

  const bucketKey = mapStockFilterOptionToBucketKey(stockFilterTab);
  if (!bucketKey) return null;

  const bucket = findStockFilterBucket(data.stockSummaryByFilter, bucketKey);
  if (!bucket) return null;

  return bucketToAnalyticsSummaryData(bucket);
}
