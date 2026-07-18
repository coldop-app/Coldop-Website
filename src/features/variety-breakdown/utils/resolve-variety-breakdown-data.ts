import { mapStockFilterOptionToBucketKey } from '@/features/analytics/utils/resolve-analytics-summary-data';
import type { StockFilterTab } from '@/features/people/utils/build-farmer-stock-summary';

import type {
  VarietyBreakdownByFilterData,
  VarietyBreakdownData,
  VarietyBreakdownFarmer,
  VarietyBreakdownSize,
} from '../types';

export function isVarietyBreakdownByFilterData(
  data: VarietyBreakdownData | VarietyBreakdownByFilterData,
): data is VarietyBreakdownByFilterData {
  return 'varietyBreakdownByFilter' in data;
}

function findStockFilterBucket(
  byFilter: Record<string, VarietyBreakdownData>,
  stockFilterTab: string,
): VarietyBreakdownData | null {
  const exact = byFilter[stockFilterTab];
  if (exact) return exact;

  const normalized = stockFilterTab.trim().toUpperCase();
  for (const [key, bucket] of Object.entries(byFilter)) {
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

export function mergeVarietyBreakdownFilterBuckets(
  data: VarietyBreakdownByFilterData,
): VarietyBreakdownData | null {
  const buckets = Object.values(data.varietyBreakdownByFilter).filter(Boolean);
  if (buckets.length === 0) return null;

  return {
    variety: buckets[0]!.variety,
    sizes: mergeSizes(buckets.map((bucket) => bucket.sizes)),
  };
}

export function resolveVarietyBreakdownData(
  data: VarietyBreakdownData | VarietyBreakdownByFilterData | null | undefined,
  stockFilterTab: StockFilterTab,
  showStockFilterTabs: boolean,
): VarietyBreakdownData | null {
  if (!data) return null;

  if (!showStockFilterTabs) {
    return isVarietyBreakdownByFilterData(data) ? null : data;
  }

  if (!isVarietyBreakdownByFilterData(data)) return null;

  if (stockFilterTab === 'all') {
    return mergeVarietyBreakdownFilterBuckets(data);
  }

  const bucketKey = mapStockFilterOptionToBucketKey(stockFilterTab);
  if (!bucketKey) return null;

  return findStockFilterBucket(data.varietyBreakdownByFilter, bucketKey);
}
