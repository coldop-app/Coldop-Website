import type { CommodityPreference } from '@/features/auth/types';
import type {
  DaybookEntry,
  IncomingGatePassSnapshot,
  OutgoingDaybookEntry,
  OutgoingOrderDetail,
} from '@/features/daybook/types';
import { isIncomingDaybookEntry, isOutgoingDaybookEntry } from '@/features/daybook/types';
import {
  formatCompactLocation,
  formatQuantity,
  locationKey,
} from '@/features/daybook/utils/format';
import {
  getMergedBagSizeOrder,
  sortSizeNamesByPreferenceOrder,
} from '@/features/incoming/utils/incoming-preferences';

export type GatePassSizeQuantityLine = {
  quantity: number;
  locationLabel: string;
};

export type OutgoingVarietyBreakdownLine = {
  variety: string;
  quantity: number;
};

export type OutgoingSizeVarietyQuantityLine = {
  variety: string;
  quantity: number;
  locationLines: GatePassSizeQuantityLine[];
};

export type OutgoingSizeDetailLine = {
  variety: string;
  quantity: number;
  locationLabel: string;
};

function findSnapshotForOrderLine(
  snapshots: IncomingGatePassSnapshot[],
  orderLine: OutgoingOrderDetail,
): IncomingGatePassSnapshot | undefined {
  const key = `${orderLine.size}\u001f${locationKey(orderLine.location)}`;

  return snapshots.find((snapshot) =>
    snapshot.bagSizes.some((bag) => `${bag.name}\u001f${locationKey(bag.location)}` === key),
  );
}

export function getOutgoingOrderLineVariety(
  entry: OutgoingDaybookEntry,
  orderLine: OutgoingOrderDetail,
): string {
  const snapshots = entry.incomingGatePassSnapshots ?? [];
  const snapshot = findSnapshotForOrderLine(snapshots, orderLine);
  return snapshot?.variety?.trim() || entry.variety?.trim() || '—';
}

export function getOutgoingVarietyBreakdown(
  entry: OutgoingDaybookEntry,
): OutgoingVarietyBreakdownLine[] {
  const totals = new Map<string, number>();

  for (const orderLine of entry.orderDetails ?? []) {
    if (orderLine.quantityIssued <= 0) continue;

    const variety = getOutgoingOrderLineVariety(entry, orderLine);
    totals.set(variety, (totals.get(variety) ?? 0) + orderLine.quantityIssued);
  }

  return Array.from(totals.entries())
    .map(([variety, quantity]) => ({ variety, quantity }))
    .sort((left, right) => left.variety.localeCompare(right.variety));
}

export function hasMultipleOutgoingVarieties(entry: OutgoingDaybookEntry): boolean {
  return getOutgoingVarietyBreakdown(entry).length > 1;
}

export function getOutgoingSizeQuantityLinesByVariety(
  entry: OutgoingDaybookEntry,
  size: string,
): OutgoingSizeVarietyQuantityLine[] {
  const normalizedSize = size.trim();
  if (!normalizedSize) return [];

  const byVariety = new Map<
    string,
    { quantity: number; locations: Map<string, GatePassSizeQuantityLine> }
  >();

  for (const orderLine of entry.orderDetails ?? []) {
    if (orderLine.size.trim() !== normalizedSize) continue;
    if (orderLine.quantityIssued <= 0) continue;

    const variety = getOutgoingOrderLineVariety(entry, orderLine);
    const existing = byVariety.get(variety) ?? {
      quantity: 0,
      locations: new Map<string, GatePassSizeQuantityLine>(),
    };

    existing.quantity += orderLine.quantityIssued;

    const locationKeyValue = locationKey(orderLine.location);
    const locationLine = existing.locations.get(locationKeyValue);

    if (locationLine) {
      locationLine.quantity += orderLine.quantityIssued;
    } else {
      existing.locations.set(locationKeyValue, {
        quantity: orderLine.quantityIssued,
        locationLabel: formatCompactLocation(orderLine.location),
      });
    }

    byVariety.set(variety, existing);
  }

  return Array.from(byVariety.entries())
    .map(([variety, data]) => ({
      variety,
      quantity: data.quantity,
      locationLines: Array.from(data.locations.values()),
    }))
    .sort((left, right) => left.variety.localeCompare(right.variety));
}

export function getOutgoingSizeQuantityDetailLines(
  entry: OutgoingDaybookEntry,
  size: string,
): OutgoingSizeDetailLine[] {
  return getOutgoingSizeQuantityLinesByVariety(entry, size).flatMap((line) =>
    line.locationLines.map((locationLine) => ({
      variety: line.variety,
      quantity: locationLine.quantity,
      locationLabel: locationLine.locationLabel,
    })),
  );
}

export function getOutgoingSizeQuantityForVariety(
  entry: OutgoingDaybookEntry,
  size: string,
  variety: string,
): number | null {
  const line = getOutgoingSizeQuantityLinesByVariety(entry, size).find(
    (item) => item.variety === variety,
  );

  return line ? line.quantity : null;
}

export function getOutgoingSizeQuantityLinesForVariety(
  entry: OutgoingDaybookEntry,
  size: string,
  variety: string,
): GatePassSizeQuantityLine[] {
  const line = getOutgoingSizeQuantityLinesByVariety(entry, size).find(
    (item) => item.variety === variety,
  );

  return line?.locationLines ?? [];
}

export function formatOutgoingVarietyBreakdownForExport(entry: OutgoingDaybookEntry): string {
  const lines = getOutgoingVarietyBreakdown(entry);
  if (lines.length <= 1) return getGatePassVariety(entry);

  return lines.map((line) => `${line.variety} (${formatQuantity(line.quantity)})`).join('\n');
}

export function collectUniqueBagSizes(rows: DaybookEntry[]): string[] {
  const sizes = new Set<string>();

  for (const row of rows) {
    if (isIncomingDaybookEntry(row)) {
      for (const bag of row.bagSizes ?? []) {
        const name = bag.name.trim();
        if (name) sizes.add(name);
      }
      continue;
    }

    if (isOutgoingDaybookEntry(row)) {
      for (const line of row.orderDetails ?? []) {
        const size = line.size.trim();
        if (size) sizes.add(size);
      }
    }
  }

  return Array.from(sizes);
}

export function orderBagSizes(sizes: string[], commodities: CommodityPreference[]): string[] {
  return sortSizeNamesByPreferenceOrder(sizes, getMergedBagSizeOrder(commodities));
}

export function getGatePassVariety(entry: DaybookEntry): string {
  if (isIncomingDaybookEntry(entry)) {
    return entry.variety?.trim() || '—';
  }

  if (isOutgoingDaybookEntry(entry)) {
    if (entry.variety?.trim()) return entry.variety.trim();

    const snapshots = entry.incomingGatePassSnapshots ?? [];
    const varieties = [
      ...new Set(
        snapshots
          .map((snapshot) => snapshot.variety)
          .filter((value): value is string => Boolean(value?.trim())),
      ),
    ];

    if (varieties.length === 1) return varieties[0];
    if (varieties.length > 1) return varieties.join(', ');

    return '—';
  }

  return '—';
}

export function getGatePassStockFilter(entry: DaybookEntry): string {
  return entry.stockFilter?.trim() || '—';
}

export function getGatePassSizeQuantity(entry: DaybookEntry, size: string): number | null {
  const normalizedSize = size.trim();
  if (!normalizedSize) return null;

  if (isIncomingDaybookEntry(entry)) {
    let total = 0;
    let found = false;

    for (const bag of entry.bagSizes ?? []) {
      if (bag.name.trim() !== normalizedSize) continue;
      found = true;
      total += bag.initialQuantity;
    }

    return found ? total : null;
  }

  if (isOutgoingDaybookEntry(entry)) {
    let total = 0;
    let found = false;

    for (const line of entry.orderDetails ?? []) {
      if (line.size.trim() !== normalizedSize) continue;
      found = true;
      total += line.quantityIssued;
    }

    return found ? total : null;
  }

  return null;
}

export function getGatePassSizeQuantityLines(
  entry: DaybookEntry,
  size: string,
): GatePassSizeQuantityLine[] {
  const normalizedSize = size.trim();
  if (!normalizedSize) return [];

  const merged = new Map<string, GatePassSizeQuantityLine>();

  if (isIncomingDaybookEntry(entry)) {
    for (const bag of entry.bagSizes ?? []) {
      if (bag.name.trim() !== normalizedSize) continue;

      const key = locationKey(bag.location);
      const existing = merged.get(key);

      if (existing) {
        existing.quantity += bag.initialQuantity;
        continue;
      }

      merged.set(key, {
        quantity: bag.initialQuantity,
        locationLabel: formatCompactLocation(bag.location),
      });
    }
  } else if (isOutgoingDaybookEntry(entry)) {
    for (const line of entry.orderDetails ?? []) {
      if (line.size.trim() !== normalizedSize) continue;

      const key = locationKey(line.location);
      const existing = merged.get(key);

      if (existing) {
        existing.quantity += line.quantityIssued;
        continue;
      }

      merged.set(key, {
        quantity: line.quantityIssued,
        locationLabel: formatCompactLocation(line.location),
      });
    }
  }

  return Array.from(merged.values());
}

export function getGatePassTotalBags(entry: DaybookEntry): number {
  if (isIncomingDaybookEntry(entry)) {
    return (entry.bagSizes ?? []).reduce((total, bag) => total + bag.initialQuantity, 0);
  }

  if (isOutgoingDaybookEntry(entry)) {
    return (entry.orderDetails ?? []).reduce((total, line) => total + line.quantityIssued, 0);
  }

  return 0;
}

export function sumSizeColumn(rows: DaybookEntry[], size: string): number {
  return rows.reduce((total, row) => {
    const quantity = getGatePassSizeQuantity(row, size);
    return total + (quantity ?? 0);
  }, 0);
}

export function sumTotalBags(rows: DaybookEntry[]): number {
  return rows.reduce((total, row) => total + getGatePassTotalBags(row), 0);
}
