import type { StorageLayoutChamber } from '@/features/auth/types';
import {
  formatUtilizationPercent,
  getStorageLayoutChamberCapacity,
} from '@/features/auth/utils/storage-layout';

import type { LocationAnalyticsChamber, LocationAnalyticsQuantityTab } from '../types';
import { getChamberQuantity } from './get-location-quantity';

function isSentinelLabel(label: string) {
  return label.startsWith('(');
}

export type ChamberUtilizationRow = {
  chamber: string;
  initialTotal: number;
  currentTotal: number;
  capacity: number;
  quantity: number;
  utilization: number;
  orderCount: number;
};

/** Build chamber utilization rows from API occupancy + layout capacity. */
export function buildChamberUtilizationRows(input: {
  chambers: LocationAnalyticsChamber[];
  storageLayout: StorageLayoutChamber[] | null | undefined;
  tab: LocationAnalyticsQuantityTab;
}): ChamberUtilizationRow[] {
  const { chambers, storageLayout, tab } = input;

  return [...chambers]
    .map((chamber) => {
      const layoutCapacity = getStorageLayoutChamberCapacity(storageLayout, chamber.chamber);
      const capacity =
        layoutCapacity != null && layoutCapacity > 0 ? layoutCapacity : chamber.initialTotal;
      const quantity = getChamberQuantity(chamber, tab);
      const utilization = Math.min(formatUtilizationPercent(chamber.currentTotal, capacity), 100);

      return {
        chamber: chamber.chamber,
        initialTotal: chamber.initialTotal,
        currentTotal: chamber.currentTotal,
        capacity,
        quantity,
        utilization,
        orderCount: chamber.orderCount,
      };
    })
    .sort((a, b) => {
      const aSentinel = isSentinelLabel(a.chamber);
      const bSentinel = isSentinelLabel(b.chamber);
      if (aSentinel !== bSentinel) return aSentinel ? 1 : -1;
      return a.chamber.localeCompare(b.chamber, 'en-IN', { numeric: true });
    });
}
