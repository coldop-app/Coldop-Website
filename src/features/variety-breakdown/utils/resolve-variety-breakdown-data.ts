import { mapStockFilterOptionToBucketKey } from '@/features/analytics/utils/resolve-analytics-summary-data';
import type {
  GenerationTab,
  StockFilterTab,
} from '@/features/people/utils/build-farmer-stock-summary';

import type {
  VarietyBreakdownByFilterAndGenerationData,
  VarietyBreakdownByFilterData,
  VarietyBreakdownByGenerationData,
  VarietyBreakdownData,
  VarietyBreakdownFarmer,
  VarietyBreakdownGroupedData,
  VarietyBreakdownSize,
} from '../types';

export function isVarietyBreakdownByFilterData(
  data: VarietyBreakdownData | VarietyBreakdownGroupedData,
): data is VarietyBreakdownByFilterData {
  return 'varietyBreakdownByFilter' in data;
}

export function isVarietyBreakdownByGenerationData(
  data: VarietyBreakdownData | VarietyBreakdownGroupedData,
): data is VarietyBreakdownByGenerationData {
  return 'varietyBreakdownByGeneration' in data;
}

export function isVarietyBreakdownByFilterAndGenerationData(
  data: VarietyBreakdownData | VarietyBreakdownGroupedData,
): data is VarietyBreakdownByFilterAndGenerationData {
  return 'varietyBreakdownByFilterAndGeneration' in data;
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

function mergeFarmers(farmersList: VarietyBreakdownFarmer[][]): VarietyBreakdownFarmer[] {
  const byName = new Map<string, VarietyBreakdownFarmer>();

  for (const farmers of farmersList) {
    for (const farmer of farmers) {
      const existing = byName.get(farmer.farmerName);
      if (!existing) {
        byName.set(farmer.farmerName, { ...farmer });
        continue;
      }

      existing.initialQuantity += farmer.initialQuantity;
      existing.currentQuantity += farmer.currentQuantity;
      existing.quantityRemoved += farmer.quantityRemoved;
    }
  }

  return Array.from(byName.values());
}

function mergeSizes(sizesList: VarietyBreakdownSize[][]): VarietyBreakdownSize[] {
  const bySize = new Map<string, VarietyBreakdownSize[]>();

  for (const sizes of sizesList) {
    for (const entry of sizes) {
      const existing = bySize.get(entry.size);
      if (!existing) {
        bySize.set(entry.size, [entry]);
        continue;
      }
      existing.push(entry);
    }
  }

  return Array.from(bySize.entries()).map(([size, entries]) => ({
    size,
    initialQuantity: entries.reduce((sum, entry) => sum + entry.initialQuantity, 0),
    currentQuantity: entries.reduce((sum, entry) => sum + entry.currentQuantity, 0),
    quantityRemoved: entries.reduce((sum, entry) => sum + entry.quantityRemoved, 0),
    farmerBreakdown: mergeFarmers(entries.map((entry) => entry.farmerBreakdown)),
  }));
}

export function mergeVarietyBreakdownBuckets(
  buckets: VarietyBreakdownData[],
): VarietyBreakdownData | null {
  if (buckets.length === 0) return null;

  return {
    variety: buckets[0]!.variety,
    sizes: mergeSizes(buckets.map((bucket) => bucket.sizes)),
  };
}

export function mergeVarietyBreakdownFilterBuckets(
  data: VarietyBreakdownByFilterData,
): VarietyBreakdownData | null {
  return mergeVarietyBreakdownBuckets(Object.values(data.varietyBreakdownByFilter).filter(Boolean));
}

function resolveKeyedBuckets(
  byKey: Record<string, VarietyBreakdownData>,
  tab: StockFilterTab | GenerationTab,
): VarietyBreakdownData | null {
  if (tab === 'all') {
    return mergeVarietyBreakdownBuckets(Object.values(byKey).filter(Boolean));
  }

  const bucketKey = mapStockFilterOptionToBucketKey(tab);
  if (!bucketKey) return null;

  return findNamedBucket(byKey, bucketKey);
}

function collectNestedBuckets(
  nested: Record<string, Record<string, VarietyBreakdownData>>,
  stockFilterTab: StockFilterTab,
  generationTab: GenerationTab,
): VarietyBreakdownData[] {
  const filterEntries =
    stockFilterTab === 'all'
      ? Object.values(nested)
      : (() => {
          const key = mapStockFilterOptionToBucketKey(stockFilterTab);
          if (!key) return [];
          const inner = findNamedBucket(nested, key);
          return inner ? [inner] : [];
        })();

  const buckets: VarietyBreakdownData[] = [];

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

export function resolveVarietyBreakdownData(
  data: VarietyBreakdownData | VarietyBreakdownGroupedData | null | undefined,
  stockFilterTab: StockFilterTab,
  showStockFilterTabs: boolean,
  generationTab: GenerationTab = 'all',
  showGenerationTabs = false,
): VarietyBreakdownData | null {
  if (!data) return null;

  if (!showStockFilterTabs && !showGenerationTabs) {
    return 'sizes' in data ? data : null;
  }

  if (showStockFilterTabs && showGenerationTabs) {
    if (!isVarietyBreakdownByFilterAndGenerationData(data)) return null;
    const buckets = collectNestedBuckets(
      data.varietyBreakdownByFilterAndGeneration,
      stockFilterTab,
      generationTab,
    );
    if (buckets.length === 0) return null;
    if (stockFilterTab !== 'all' && generationTab !== 'all' && buckets.length === 1) {
      return buckets[0]!;
    }
    return mergeVarietyBreakdownBuckets(buckets);
  }

  if (showGenerationTabs) {
    if (!isVarietyBreakdownByGenerationData(data)) return null;
    return resolveKeyedBuckets(data.varietyBreakdownByGeneration, generationTab);
  }

  if (!isVarietyBreakdownByFilterData(data)) return null;
  return resolveKeyedBuckets(data.varietyBreakdownByFilter, stockFilterTab);
}
