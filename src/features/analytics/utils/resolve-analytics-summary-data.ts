import type {
  AnalyticsChartData,
  AnalyticsFlatSeriesPoint,
  AnalyticsGroupedSummaryData,
  AnalyticsStockFilterBucket,
  AnalyticsStockSize,
  AnalyticsStockVariety,
  AnalyticsSummaryByFilterAndGenerationData,
  AnalyticsSummaryByFilterData,
  AnalyticsSummaryByGenerationData,
  AnalyticsSummaryData,
  AnalyticsTopSize,
  AnalyticsTopVariety,
} from '@/features/analytics/types';
import type {
  GenerationTab,
  StockFilterTab,
} from '@/features/people/utils/build-farmer-stock-summary';

/** Normalized preference option key (matches dynamic API map keys). */
export type AnalyticsStockFilterBucketKey = string;

export function isAnalyticsSummaryByFilterData(
  data: AnalyticsSummaryData | AnalyticsGroupedSummaryData,
): data is AnalyticsSummaryByFilterData {
  return 'stockSummaryByFilter' in data;
}

export function isAnalyticsSummaryByGenerationData(
  data: AnalyticsSummaryData | AnalyticsGroupedSummaryData,
): data is AnalyticsSummaryByGenerationData {
  return 'stockSummaryByGeneration' in data;
}

export function isAnalyticsSummaryByFilterAndGenerationData(
  data: AnalyticsSummaryData | AnalyticsGroupedSummaryData,
): data is AnalyticsSummaryByFilterAndGenerationData {
  return 'stockSummaryByFilterAndGeneration' in data;
}

export function mapStockFilterOptionToBucketKey(option: string): AnalyticsStockFilterBucketKey | null {
  const trimmed = option.trim();
  if (!trimmed || trimmed.toLowerCase() === 'all') return null;
  return trimmed;
}

function findNamedBucket<T>(byKey: Record<string, T>, tab: string): T | null {
  const exact = byKey[tab];
  if (exact) return exact;

  const normalized = tab.trim().toUpperCase();
  for (const [key, bucket] of Object.entries(byKey)) {
    if (key.trim().toUpperCase() === normalized) return bucket;
  }

  return null;
}

function findStockFilterBucket(
  byFilter: Record<string, AnalyticsStockFilterBucket>,
  stockFilterTab: string,
): AnalyticsStockFilterBucket | null {
  return findNamedBucket(byFilter, stockFilterTab);
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

export function mergeAnalyticsBuckets(buckets: AnalyticsStockFilterBucket[]): AnalyticsSummaryData {
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

export function mergeAnalyticsFilterBuckets(
  data: AnalyticsSummaryByFilterData,
): AnalyticsSummaryData {
  return mergeAnalyticsBuckets(Object.values(data.stockSummaryByFilter).filter(Boolean));
}

function resolveKeyedBuckets(
  byKey: Record<string, AnalyticsStockFilterBucket>,
  tab: StockFilterTab | GenerationTab,
): AnalyticsSummaryData | null {
  if (tab === 'all') {
    return mergeAnalyticsBuckets(Object.values(byKey).filter(Boolean));
  }

  const bucketKey = mapStockFilterOptionToBucketKey(tab);
  if (!bucketKey) return null;

  const bucket = findStockFilterBucket(byKey, bucketKey);
  if (!bucket) return null;

  return bucketToAnalyticsSummaryData(bucket);
}

function collectNestedBuckets(
  nested: Record<string, Record<string, AnalyticsStockFilterBucket>>,
  stockFilterTab: StockFilterTab,
  generationTab: GenerationTab,
): AnalyticsStockFilterBucket[] {
  const filterEntries =
    stockFilterTab === 'all'
      ? Object.values(nested)
      : (() => {
          const key = mapStockFilterOptionToBucketKey(stockFilterTab);
          if (!key) return [];
          const inner = findNamedBucket(nested, key);
          return inner ? [inner] : [];
        })();

  const buckets: AnalyticsStockFilterBucket[] = [];

  for (const inner of filterEntries) {
    if (generationTab === 'all') {
      buckets.push(...Object.values(inner).filter(Boolean));
      continue;
    }

    const generationKey = mapStockFilterOptionToBucketKey(generationTab);
    if (!generationKey) continue;
    const bucket = findNamedBucket(inner, generationKey);
    if (bucket) buckets.push(bucket);
  }

  return buckets;
}

export function resolveAnalyticsSummaryData(
  data: AnalyticsSummaryData | AnalyticsGroupedSummaryData | null | undefined,
  stockFilterTab: StockFilterTab,
  showStockFilterTabs: boolean,
  generationTab: GenerationTab = 'all',
  showGenerationTabs = false,
): AnalyticsSummaryData | null {
  if (!data) return null;

  if (!showStockFilterTabs && !showGenerationTabs) {
    return 'stockSummary' in data ? data : null;
  }

  if (showStockFilterTabs && showGenerationTabs) {
    if (!isAnalyticsSummaryByFilterAndGenerationData(data)) return null;
    const buckets = collectNestedBuckets(
      data.stockSummaryByFilterAndGeneration,
      stockFilterTab,
      generationTab,
    );
    if (buckets.length === 0) return null;
    if (stockFilterTab !== 'all' && generationTab !== 'all' && buckets.length === 1) {
      return bucketToAnalyticsSummaryData(buckets[0]!);
    }
    return mergeAnalyticsBuckets(buckets);
  }

  if (showGenerationTabs) {
    if (!isAnalyticsSummaryByGenerationData(data)) return null;
    return resolveKeyedBuckets(data.stockSummaryByGeneration, generationTab);
  }

  if (!isAnalyticsSummaryByFilterData(data)) return null;
  return resolveKeyedBuckets(data.stockSummaryByFilter, stockFilterTab);
}
