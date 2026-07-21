import type { IncomingBagSize } from '@/features/daybook/types';
import {
  formatCompactLocation,
  formatQuantity,
  hasDaybookLocation,
  locationKey,
} from '@/features/daybook/utils/format';
import type { IncomingGatePassReportRecord } from '@/features/incoming-report/api/types';
import type { IncomingQuantityMode } from '@/features/incoming-report/components/columns';
import type { GatePassReportPdfCell } from '@/lib/gate-pass-report-pdf/types';
import { normalizePaltaiLocations } from '@/features/incoming/utils/paltai-location';

type LocationLine = {
  quantity: number;
  locationLabel: string | null;
  paltaiLabel: string | null;
};

function hasLocation(location: IncomingBagSize['location']): boolean {
  return hasDaybookLocation(location);
}

function formatPaltaiLabel(paltaiLocation?: IncomingBagSize['paltaiLocation']): string | null {
  const locations = normalizePaltaiLocations(paltaiLocation);
  if (locations.length === 0) return null;
  return locations.map(formatCompactLocation).join(' → ');
}

function getBagQuantity(bag: IncomingBagSize, quantityMode: IncomingQuantityMode): number {
  return quantityMode === 'current' ? bag.currentQuantity : bag.initialQuantity;
}

function buildMergedLocationLines(
  bags: IncomingBagSize[],
  quantityMode: IncomingQuantityMode,
): LocationLine[] {
  const merged = new Map<string, LocationLine>();

  for (const bag of bags) {
    const qty = getBagQuantity(bag, quantityMode);
    const key = locationKey(bag.location);
    const locationLabel = hasLocation(bag.location) ? formatCompactLocation(bag.location) : null;
    const paltaiLabel = formatPaltaiLabel(bag.paltaiLocation);

    const existing = merged.get(key);

    if (existing) {
      existing.quantity += qty;
      if (paltaiLabel && !existing.paltaiLabel) {
        existing.paltaiLabel = paltaiLabel;
      }
      continue;
    }

    merged.set(key, {
      quantity: qty,
      locationLabel,
      paltaiLabel,
    });
  }

  return Array.from(merged.values());
}

function formatLocationSub(line: LocationLine): string | undefined {
  const parts: string[] = [];

  if (line.locationLabel) {
    parts.push(`(${line.locationLabel})`);
  }

  if (line.paltaiLabel) {
    parts.push(`Paltai: (${line.paltaiLabel})`);
  }

  return parts.length > 0 ? parts.join('\n') : undefined;
}

function formatMultiLocationSegment(line: LocationLine): string {
  const quantity = formatQuantity(line.quantity);

  if (!line.locationLabel) {
    return quantity;
  }

  if (line.paltaiLabel) {
    return `${quantity} (${line.locationLabel}, Paltai: ${line.paltaiLabel})`;
  }

  return `${quantity} (${line.locationLabel})`;
}

export function mapIncomingSizeCellForPdf(
  row: IncomingGatePassReportRecord,
  columnId: string,
  quantityMode: IncomingQuantityMode,
  showLocation: boolean,
  align: 'left' | 'right' = 'right',
): GatePassReportPdfCell {
  const sizeName = columnId.replace(/^size-/, '');
  const bags = row.bagSizes.filter((bag) => bag.name === sizeName);

  if (!bags.length) {
    return { text: '—', align, isEmpty: true };
  }

  if (!showLocation) {
    const total = bags.reduce((sum, bag) => sum + getBagQuantity(bag, quantityMode), 0);

    return { text: formatQuantity(total), align };
  }

  const lines = buildMergedLocationLines(bags, quantityMode);
  const total = lines.reduce((sum, line) => sum + line.quantity, 0);
  const hasAnyLocation = lines.some(
    (line) => line.locationLabel != null || line.paltaiLabel != null,
  );

  if (!hasAnyLocation) {
    return { text: formatQuantity(total), align };
  }

  if (lines.length === 1) {
    const line = lines[0]!;
    const sub = formatLocationSub(line);

    if (!sub) {
      return { text: formatQuantity(line.quantity), align };
    }

    return {
      text: formatQuantity(line.quantity),
      align,
      stack: { main: formatQuantity(line.quantity), sub },
    };
  }

  const sub = `(${lines.map((line) => formatMultiLocationSegment(line)).join(', ')})`;

  return {
    text: formatQuantity(total),
    align,
    stack: { main: formatQuantity(total), sub },
  };
}
