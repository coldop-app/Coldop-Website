import type { StorageLayoutChamber } from '@/features/auth/types';
import {
  formatUtilizationPercent,
  getStorageLayoutFloorCapacity,
  getStorageLayoutFloors,
} from '@/features/auth/utils/storage-layout';

import type { LocationAnalyticsFloor, LocationAnalyticsQuantityTab } from '../types';
import { getFloorQuantity } from './get-location-quantity';

function isSentinelFloor(label: string) {
  return label.startsWith('(');
}

export type MergedFloorRow = {
  floor: string;
  initialTotal: number;
  currentTotal: number;
  capacity: number;
  quantity: number;
  utilization: number;
};

/**
 * Merge storage-layout floors (canonical order) with API occupancy.
 * Layout floors first; append API-only / sentinel floors afterward.
 */
export function mergeChamberFloors(input: {
  chamberName: string;
  apiFloors: LocationAnalyticsFloor[];
  storageLayout: StorageLayoutChamber[] | null | undefined;
  tab: LocationAnalyticsQuantityTab;
}): MergedFloorRow[] {
  const { chamberName, apiFloors, storageLayout, tab } = input;
  const apiByName = new Map(apiFloors.map((floor) => [floor.floor, floor]));
  const layoutFloorNames = getStorageLayoutFloors(storageLayout, chamberName);
  const seen = new Set<string>();
  const rows: MergedFloorRow[] = [];

  const pushFloor = (floorName: string, apiFloor?: LocationAnalyticsFloor) => {
    if (seen.has(floorName)) return;
    seen.add(floorName);

    const initialTotal = apiFloor?.initialTotal ?? 0;
    const currentTotal = apiFloor?.currentTotal ?? 0;
    const layoutCapacity = getStorageLayoutFloorCapacity(storageLayout, chamberName, floorName);
    const capacity = layoutCapacity != null && layoutCapacity > 0 ? layoutCapacity : initialTotal;
    const quantity = apiFloor ? getFloorQuantity(apiFloor, tab) : 0;
    const utilization = Math.min(formatUtilizationPercent(currentTotal, capacity), 100);

    rows.push({
      floor: floorName,
      initialTotal,
      currentTotal,
      capacity,
      quantity,
      utilization,
    });
  };

  for (const floorName of layoutFloorNames) {
    pushFloor(floorName, apiByName.get(floorName));
  }

  const apiOnly = [...apiFloors]
    .filter((floor) => !seen.has(floor.floor))
    .sort((a, b) => {
      const aSentinel = isSentinelFloor(a.floor);
      const bSentinel = isSentinelFloor(b.floor);
      if (aSentinel !== bSentinel) return aSentinel ? 1 : -1;
      return a.floor.localeCompare(b.floor, 'en-IN', { numeric: true });
    });

  for (const floor of apiOnly) {
    pushFloor(floor.floor, floor);
  }

  return rows;
}
