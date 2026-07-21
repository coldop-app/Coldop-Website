import type { DaybookLocation, IncomingGatePassSnapshot } from '@/features/daybook/types';
import {
  formatCompactLocation,
  formatQuantity,
  getSizeQuantityLocationLabels,
  locationKey,
} from '@/features/daybook/utils/format';
import type {
  OutgoingGatePassReportRecord,
  OutgoingReportOrderDetail,
} from '@/features/outgoing-report/api/types';
import type { OutgoingQuantityMode } from '@/features/outgoing-report/components/columns';
import { bagMatchesLocation } from '@/features/incoming/utils/paltai-location';

export type OutgoingReportVarietyBreakdownLine = {
  variety: string;
  quantity: number;
};

export type OutgoingReportSizeDetailLine = {
  variety: string;
  quantity: number;
  locationLabel: string | null;
  paltaiLocationLabels?: string[];
};

function findSnapshotBagForOrderLine(
  snapshots: IncomingGatePassSnapshot[],
  orderLine: OutgoingReportOrderDetail,
) {
  if (!orderLine.location) return undefined;

  for (const snapshot of snapshots) {
    const matchedBag = snapshot.bagSizes.find(
      (bag) => bagMatchesLocation(bag, orderLine.location!) && bag.name === orderLine.size,
    );
    if (matchedBag) return matchedBag;
  }

  return undefined;
}

function findSnapshotForOrderLine(
  snapshots: IncomingGatePassSnapshot[],
  orderLine: OutgoingReportOrderDetail,
): IncomingGatePassSnapshot | undefined {
  if (!orderLine.location) return undefined;

  return snapshots.find((snapshot) =>
    snapshot.bagSizes.some(
      (bag) => bagMatchesLocation(bag, orderLine.location!) && bag.name === orderLine.size,
    ),
  );
}

export function getOrderLineQuantity(
  detail: OutgoingReportOrderDetail,
  quantityMode: OutgoingQuantityMode,
): number {
  return quantityMode === 'issued' ? detail.quantityIssued : detail.quantityAvailable;
}

export function getOutgoingReportOrderLineVariety(
  row: OutgoingGatePassReportRecord,
  orderLine: OutgoingReportOrderDetail,
): string {
  const snapshots = row.incomingGatePassSnapshots ?? [];
  const snapshot = findSnapshotForOrderLine(snapshots, orderLine);
  return snapshot?.variety?.trim() || row.variety?.trim() || '—';
}

export function getOutgoingReportType(row: OutgoingGatePassReportRecord): string {
  if (row.type?.trim()) return row.type.trim();

  const snapshots = row.incomingGatePassSnapshots ?? [];
  const types = [
    ...new Set(
      snapshots
        .flatMap((snapshot) => snapshot.bagSizes.map((bag) => bag.type))
        .filter((value): value is string => Boolean(value?.trim())),
    ),
  ];

  if (types.length === 1) return types[0];
  if (types.length > 1) return types.join(', ');

  return '';
}

export function getOutgoingReportVariety(row: OutgoingGatePassReportRecord): string {
  if (row.varietySlice?.trim()) return row.varietySlice.trim();
  if (row.variety?.trim()) return row.variety.trim();

  const snapshots = row.incomingGatePassSnapshots ?? [];
  const varieties = [
    ...new Set(
      snapshots
        .map((snapshot) => snapshot.variety)
        .filter((value): value is string => Boolean(value?.trim())),
    ),
  ];

  if (varieties.length === 1) return varieties[0];
  if (varieties.length > 1) return varieties.join(', ');

  return '';
}

export function getOutgoingReportRowId(row: OutgoingGatePassReportRecord): string {
  if (row.varietySlice) return `${row._id}\u001f${row.varietySlice}`;
  return row._id;
}

export function getOutgoingReportOrderDetailsForVariety(
  row: OutgoingGatePassReportRecord,
  variety: string,
): OutgoingReportOrderDetail[] {
  return row.orderDetails.filter(
    (detail) => getOutgoingReportOrderLineVariety(row, detail) === variety,
  );
}

/**
 * When grouping by variety, expand multi-variety gate passes into one row
 * per variety (scoped orderDetails + totalBags), matching people-report.
 */
export function expandOutgoingReportRowsByVariety(
  rows: readonly OutgoingGatePassReportRecord[],
  quantityMode: OutgoingQuantityMode = 'issued',
  splitByVariety = false,
): OutgoingGatePassReportRecord[] {
  if (!splitByVariety) return [...rows];

  const expanded: OutgoingGatePassReportRecord[] = [];

  for (const row of rows) {
    const breakdown = getOutgoingReportVarietyBreakdown(row, quantityMode);

    if (breakdown.length > 1) {
      for (const line of breakdown) {
        expanded.push({
          ...row,
          variety: line.variety,
          varietySlice: line.variety,
          orderDetails: getOutgoingReportOrderDetailsForVariety(row, line.variety),
          totalBags: line.quantity,
        });
      }
      continue;
    }

    if (breakdown.length === 1) {
      const variety = breakdown[0]!.variety;
      expanded.push({
        ...row,
        variety,
        varietySlice: variety,
      });
      continue;
    }

    expanded.push(row);
  }

  return expanded;
}

export function getOutgoingReportVarietyBreakdown(
  row: OutgoingGatePassReportRecord,
  quantityMode: OutgoingQuantityMode = 'issued',
): OutgoingReportVarietyBreakdownLine[] {
  const totals = new Map<string, number>();

  for (const orderLine of row.orderDetails) {
    const quantity = getOrderLineQuantity(orderLine, quantityMode);
    if (quantity <= 0) continue;

    const variety = getOutgoingReportOrderLineVariety(row, orderLine);
    totals.set(variety, (totals.get(variety) ?? 0) + quantity);
  }

  return Array.from(totals.entries())
    .map(([variety, quantity]) => ({ variety, quantity }))
    .sort((left, right) => left.variety.localeCompare(right.variety));
}

export function hasMultipleOutgoingReportVarieties(
  row: OutgoingGatePassReportRecord,
  quantityMode: OutgoingQuantityMode = 'issued',
): boolean {
  return getOutgoingReportVarietyBreakdown(row, quantityMode).length > 1;
}

function formatReportOrderLineLocation(location?: DaybookLocation): string | null {
  if (!location) return null;
  return formatCompactLocation(location);
}

export function getOutgoingReportSizeQuantityDetailLines(
  row: OutgoingGatePassReportRecord,
  size: string,
  quantityMode: OutgoingQuantityMode = 'issued',
): OutgoingReportSizeDetailLine[] {
  const normalizedSize = size.trim();
  if (!normalizedSize) return [];

  const byVariety = new Map<string, Map<string, OutgoingReportSizeDetailLine>>();

  for (const orderLine of row.orderDetails) {
    if (orderLine.size.trim() !== normalizedSize) continue;

    const quantity = getOrderLineQuantity(orderLine, quantityMode);
    if (quantity <= 0) continue;

    const variety = getOutgoingReportOrderLineVariety(row, orderLine);
    const locationLabel = formatReportOrderLineLocation(orderLine.location);
    const locationKeyValue = orderLine.location
      ? locationKey(orderLine.location)
      : '__no_location__';
    const matchedBag = findSnapshotBagForOrderLine(row.incomingGatePassSnapshots ?? [], orderLine);
    const paltaiLocationLabels = matchedBag
      ? getSizeQuantityLocationLabels(matchedBag.location, matchedBag.paltaiLocation)
          .paltaiLocationLabels
      : [];

    const varietyLocations =
      byVariety.get(variety) ?? new Map<string, OutgoingReportSizeDetailLine>();

    const existing = varietyLocations.get(locationKeyValue);

    if (existing) {
      existing.quantity += quantity;
      if (
        (existing.paltaiLocationLabels?.length ?? 0) === 0 &&
        paltaiLocationLabels.length > 0
      ) {
        existing.paltaiLocationLabels = paltaiLocationLabels;
      }
    } else {
      varietyLocations.set(locationKeyValue, {
        variety,
        quantity,
        locationLabel,
        paltaiLocationLabels,
      });
    }

    byVariety.set(variety, varietyLocations);
  }

  return Array.from(byVariety.entries())
    .flatMap(([, locations]) => Array.from(locations.values()))
    .sort((left, right) => {
      const varietyCompare = left.variety.localeCompare(right.variety);
      if (varietyCompare !== 0) return varietyCompare;

      return (left.locationLabel ?? '').localeCompare(right.locationLabel ?? '');
    });
}

export function formatOutgoingReportVarietyBreakdownForExport(
  row: OutgoingGatePassReportRecord,
  quantityMode: OutgoingQuantityMode = 'issued',
): string {
  const lines = getOutgoingReportVarietyBreakdown(row, quantityMode);
  if (lines.length <= 1) return getOutgoingReportVariety(row);

  return lines
    .map((line) => `${line.variety} (${line.quantity.toLocaleString('en-IN')})`)
    .join('\n');
}

/** Parenthetical sub-line for a single multi-variety size detail. */
export function formatOutgoingReportSizeDetailSubForExport(
  line: OutgoingReportSizeDetailLine,
): string {
  const paltai =
    line.paltaiLocationLabels && line.paltaiLocationLabels.length > 0
      ? `, Paltai: ${line.paltaiLocationLabels.join(' → ')}`
      : '';

  if (line.locationLabel) {
    return `(${line.locationLabel}${paltai}, ${line.variety})`;
  }

  return `(${line.variety})`;
}

/** Segment inside a multi-location/variety parenthetical breakdown. */
export function formatOutgoingReportSizeDetailSegmentForExport(
  line: OutgoingReportSizeDetailLine,
): string {
  const quantity = formatQuantity(line.quantity);
  const paltai =
    line.paltaiLocationLabels && line.paltaiLocationLabels.length > 0
      ? `, Paltai: ${line.paltaiLocationLabels.join(' → ')}`
      : '';

  if (line.locationLabel) {
    return `${quantity} (${line.locationLabel}${paltai}, ${line.variety})`;
  }

  return `${quantity} (${line.variety})`;
}

/**
 * Stacked Excel/preview cell for multi-variety size details:
 * one line → `qty\\n(loc, variety)`; many → `TOTAL\\n(qty (loc, variety), …)`.
 */
export function formatOutgoingReportSizeDetailLinesForExport(
  lines: readonly OutgoingReportSizeDetailLine[],
): string | null {
  if (lines.length === 0) return null;

  if (lines.length === 1) {
    const line = lines[0]!;
    return `${formatQuantity(line.quantity)}\n${formatOutgoingReportSizeDetailSubForExport(line)}`;
  }

  const total = lines.reduce((sum, line) => sum + line.quantity, 0);
  const breakdown = lines
    .map((line) => formatOutgoingReportSizeDetailSegmentForExport(line))
    .join(', ');

  return `${formatQuantity(total)}\n(${breakdown})`;
}
