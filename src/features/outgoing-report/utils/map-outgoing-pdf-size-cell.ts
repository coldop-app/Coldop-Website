import type { DaybookLocation } from '@/features/daybook/types';
import {
  formatCompactLocation,
  formatQuantity,
  locationKey,
} from '@/features/daybook/utils/format';
import type {
  OutgoingGatePassReportRecord,
  OutgoingReportOrderDetail,
} from '@/features/outgoing-report/api/types';
import type { OutgoingQuantityMode } from '@/features/outgoing-report/components/columns';
import {
  formatOutgoingReportSizeDetailSegmentForExport,
  formatOutgoingReportSizeDetailSubForExport,
  getOrderLineQuantity,
  getOutgoingReportSizeQuantityDetailLines,
  hasMultipleOutgoingReportVarieties,
} from '@/features/outgoing-report/utils/report-row-values';
import type { GatePassReportPdfCell } from '@/lib/gate-pass-report-pdf/types';

type LocationLine = {
  quantity: number;
  locationLabel: string | null;
};

function hasLocation(location?: DaybookLocation): boolean {
  if (!location) return false;
  return Boolean(location.chamber || location.floor || location.row);
}

function buildMergedLocationLines(
  details: OutgoingReportOrderDetail[],
  quantityMode: OutgoingQuantityMode,
): LocationLine[] {
  const merged = new Map<string, LocationLine>();

  for (const detail of details) {
    const qty = getOrderLineQuantity(detail, quantityMode);
    if (qty <= 0) continue;

    const key = detail.location ? locationKey(detail.location) : '__no_location__';
    const locationLabel = hasLocation(detail.location)
      ? formatCompactLocation(detail.location!)
      : null;

    const existing = merged.get(key);

    if (existing) {
      existing.quantity += qty;
      continue;
    }

    merged.set(key, { quantity: qty, locationLabel });
  }

  return Array.from(merged.values());
}

function mapSingleVarietySizeCell(
  details: OutgoingReportOrderDetail[],
  quantityMode: OutgoingQuantityMode,
  showLocation: boolean,
  align: 'left' | 'right',
): GatePassReportPdfCell {
  const lines = buildMergedLocationLines(details, quantityMode);

  if (!lines.length) {
    return { text: '—', align, isEmpty: true };
  }

  const total = lines.reduce((sum, line) => sum + line.quantity, 0);

  if (!showLocation) {
    return { text: formatQuantity(total), align };
  }

  const hasAnyLocation = lines.some((line) => line.locationLabel != null);

  if (!hasAnyLocation) {
    return { text: formatQuantity(total), align };
  }

  if (lines.length === 1) {
    const line = lines[0]!;
    return {
      text: formatQuantity(line.quantity),
      align,
      stack: {
        main: formatQuantity(line.quantity),
        sub: `(${line.locationLabel})`,
      },
    };
  }

  const sub = `(${lines
    .map((line) =>
      line.locationLabel
        ? `${formatQuantity(line.quantity)} (${line.locationLabel})`
        : formatQuantity(line.quantity),
    )
    .join(', ')})`;

  return {
    text: formatQuantity(total),
    align,
    stack: { main: formatQuantity(total), sub },
  };
}

export function mapOutgoingSizeCellForPdf(
  row: OutgoingGatePassReportRecord,
  columnId: string,
  quantityMode: OutgoingQuantityMode,
  showLocation = true,
  align: 'left' | 'right' = 'right',
): GatePassReportPdfCell {
  const sizeName = columnId.replace(/^size-/, '');

  if (!row.varietySlice && hasMultipleOutgoingReportVarieties(row, quantityMode)) {
    const detailLines = getOutgoingReportSizeQuantityDetailLines(row, sizeName, quantityMode);

    if (!detailLines.length) {
      return { text: '—', align, isEmpty: true };
    }

    if (!showLocation) {
      const total = detailLines.reduce((sum, line) => sum + line.quantity, 0);
      return { text: formatQuantity(total), align };
    }

    if (detailLines.length === 1) {
      const line = detailLines[0]!;
      return {
        text: formatQuantity(line.quantity),
        align,
        stack: {
          main: formatQuantity(line.quantity),
          sub: formatOutgoingReportSizeDetailSubForExport(line),
        },
      };
    }

    const total = detailLines.reduce((sum, line) => sum + line.quantity, 0);
    const sub = `(${detailLines
      .map((line) => formatOutgoingReportSizeDetailSegmentForExport(line))
      .join(', ')})`;

    return {
      text: formatQuantity(total),
      align,
      stack: { main: formatQuantity(total), sub },
    };
  }

  const details = row.orderDetails.filter((detail) => detail.size === sizeName);

  if (!details.length) {
    return { text: '—', align, isEmpty: true };
  }

  return mapSingleVarietySizeCell(details, quantityMode, showLocation, align);
}
