import {
  NO_CHAMBER,
  NO_FLOOR,
  type LocationAnalyticsChamber,
  type LocationAnalyticsFarmer,
  type LocationAnalyticsFloor,
  type LocationAnalyticsOrder,
  type LocationAnalyticsQuantityTab,
} from '../types';

type FloorTotals = {
  floor: string;
  initialTotal: number;
  currentTotal: number;
};

type ChamberAccum = {
  chamber: string;
  floors: Map<string, FloorTotals>;
  orders: LocationAnalyticsOrder[];
};

function isSentinelLabel(label: string) {
  return label.startsWith('(');
}

/**
 * Build location-analytics chamber structures from a single farmer's orders
 * so the By Location utilization UI can be reused for farmer detail.
 */
export function buildFarmerLocationChambers(
  farmer: LocationAnalyticsFarmer,
): LocationAnalyticsChamber[] {
  const chambers = new Map<string, ChamberAccum>();

  const getChamber = (name: string): ChamberAccum => {
    let chamber = chambers.get(name);
    if (!chamber) {
      chamber = { chamber: name, floors: new Map(), orders: [] };
      chambers.set(name, chamber);
    }
    return chamber;
  };

  for (const order of farmer.orders) {
    const bagsByChamber = new Map<string, typeof order.bagSizes>();

    for (const bag of order.bagSizes) {
      const chamberName = bag.location.chamber.trim() || NO_CHAMBER;
      const floorName = bag.location.floor.trim() || NO_FLOOR;

      const chamber = getChamber(chamberName);
      const existing = chamber.floors.get(floorName);
      if (existing) {
        existing.initialTotal += bag.initialQuantity;
        existing.currentTotal += bag.currentQuantity;
      } else {
        chamber.floors.set(floorName, {
          floor: floorName,
          initialTotal: bag.initialQuantity,
          currentTotal: bag.currentQuantity,
        });
      }

      const chamberBags = bagsByChamber.get(chamberName) ?? [];
      chamberBags.push(bag);
      bagsByChamber.set(chamberName, chamberBags);
    }

    for (const [chamberName, bagSizes] of bagsByChamber) {
      getChamber(chamberName).orders.push({
        ...order,
        bagSizes,
      });
    }
  }

  return [...chambers.values()]
    .map((chamber): LocationAnalyticsChamber => {
      const floors: LocationAnalyticsFloor[] = [...chamber.floors.values()].sort((a, b) => {
        const aSentinel = isSentinelLabel(a.floor);
        const bSentinel = isSentinelLabel(b.floor);
        if (aSentinel !== bSentinel) return aSentinel ? 1 : -1;
        return a.floor.localeCompare(b.floor, 'en-IN', { numeric: true });
      });

      const initialTotal = floors.reduce((sum, floor) => sum + floor.initialTotal, 0);
      const currentTotal = floors.reduce((sum, floor) => sum + floor.currentTotal, 0);

      return {
        chamber: chamber.chamber,
        initialTotal,
        currentTotal,
        orderCount: chamber.orders.length,
        floors,
        orders: chamber.orders,
      };
    })
    .filter((chamber) => chamber.initialTotal > 0 || chamber.currentTotal > 0)
    .sort((a, b) => {
      const aSentinel = isSentinelLabel(a.chamber);
      const bSentinel = isSentinelLabel(b.chamber);
      if (aSentinel !== bSentinel) return aSentinel ? 1 : -1;
      return a.chamber.localeCompare(b.chamber, 'en-IN', { numeric: true });
    });
}

/** Whether the farmer has any bags for the active quantity tab. */
export function farmerHasStockForTab(
  chambers: LocationAnalyticsChamber[],
  tab: LocationAnalyticsQuantityTab,
): boolean {
  return chambers.some((chamber) =>
    tab === 'current' ? chamber.currentTotal > 0 : chamber.initialTotal > 0,
  );
}

export function filterFarmerRowsByName<T extends { farmerName: string }>(
  rows: T[],
  query: string,
): T[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return rows;
  return rows.filter((row) => row.farmerName.toLowerCase().includes(normalized));
}

/** Recalculate share % against a filtered bag total. */
export function withFilteredShares<T extends { totalBags: number; share: number }>(rows: T[]): T[] {
  const grandTotal = rows.reduce((sum, row) => sum + row.totalBags, 0);
  return rows.map((row) => ({
    ...row,
    share: grandTotal > 0 ? (row.totalBags / grandTotal) * 100 : 0,
  }));
}
