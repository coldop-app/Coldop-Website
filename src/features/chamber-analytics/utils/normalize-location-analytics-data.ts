import {
  NO_CHAMBER,
  NO_FLOOR,
  type LocationAnalyticsChamber,
  type LocationAnalyticsData,
  type LocationAnalyticsFloor,
  type LocationAnalyticsOrder,
} from '../types';
import { getEffectiveAnalyticsBagLocation } from './get-effective-analytics-location';

type ChamberAccum = {
  chamber: string;
  floors: Map<string, LocationAnalyticsFloor>;
  orders: Map<string, LocationAnalyticsOrder & { bagSizes: LocationAnalyticsOrder['bagSizes'] }>;
};

function isSentinelLabel(label: string) {
  return label.startsWith('(');
}

function collectUniqueOrders(data: LocationAnalyticsData): LocationAnalyticsOrder[] {
  const orders = new Map<string, LocationAnalyticsOrder>();

  for (const chamber of data.byLocation.chambers) {
    for (const order of chamber.orders) {
      orders.set(order._id, order);
    }
  }

  for (const farmer of data.byFarmer) {
    for (const order of farmer.orders) {
      orders.set(order._id, order);
    }
  }

  return [...orders.values()];
}

/** Rebuild location chambers using latest paltai as effective location when present. */
export function rebuildLocationAnalyticsByEffectiveLocation(
  data: LocationAnalyticsData,
): LocationAnalyticsData {
  const orders = collectUniqueOrders(data);
  const chambers = new Map<string, ChamberAccum>();

  const getChamber = (name: string): ChamberAccum => {
    let chamber = chambers.get(name);
    if (!chamber) {
      chamber = { chamber: name, floors: new Map(), orders: new Map() };
      chambers.set(name, chamber);
    }
    return chamber;
  };

  for (const order of orders) {
    const bagsByChamber = new Map<string, LocationAnalyticsOrder['bagSizes']>();

    for (const bag of order.bagSizes) {
      const effectiveLocation = getEffectiveAnalyticsBagLocation(bag);
      const chamberName = effectiveLocation.chamber.trim() || NO_CHAMBER;
      const floorName = effectiveLocation.floor.trim() || NO_FLOOR;

      const chamber = getChamber(chamberName);
      const existingFloor = chamber.floors.get(floorName);
      if (existingFloor) {
        existingFloor.initialTotal += bag.initialQuantity;
        existingFloor.currentTotal += bag.currentQuantity;
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
      const chamber = getChamber(chamberName);
      const existingOrder = chamber.orders.get(order._id);
      if (existingOrder) {
        existingOrder.bagSizes.push(...bagSizes);
      } else {
        chamber.orders.set(order._id, {
          ...order,
          bagSizes: [...bagSizes],
        });
      }
    }
  }

  const rebuiltChambers: LocationAnalyticsChamber[] = [...chambers.values()]
    .map((chamber): LocationAnalyticsChamber => {
      const floors = [...chamber.floors.values()].sort((a, b) => {
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
        orderCount: chamber.orders.size,
        floors,
        orders: [...chamber.orders.values()],
      };
    })
    .filter((chamber) => chamber.initialTotal > 0 || chamber.currentTotal > 0)
    .sort((a, b) => {
      const aSentinel = isSentinelLabel(a.chamber);
      const bSentinel = isSentinelLabel(b.chamber);
      if (aSentinel !== bSentinel) return aSentinel ? 1 : -1;
      return a.chamber.localeCompare(b.chamber, 'en-IN', { numeric: true });
    });

  return {
    ...data,
    byLocation: {
      chambers: rebuiltChambers,
    },
  };
}

export function normalizeLocationAnalyticsData(data: LocationAnalyticsData): LocationAnalyticsData {
  return rebuildLocationAnalyticsByEffectiveLocation(data);
}
