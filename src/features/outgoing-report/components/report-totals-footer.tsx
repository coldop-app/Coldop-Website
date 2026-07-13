import type { Row } from '@tanstack/react-table';

import type { OutgoingGatePassReportRecord } from '@/features/outgoing-report/api/types';
import { cn } from '@/lib/utils';

import type { OutgoingQuantityMode } from './columns';

const numberFormatter = new Intl.NumberFormat('en-IN');

function formatTotalValue(value: number) {
  return numberFormatter.format(value);
}

function renderTotalValue(value: number) {
  return (
    <span className="text-foreground font-semibold tabular-nums">{formatTotalValue(value)}</span>
  );
}

function sumOrderSizeQuantity(
  rows: readonly Row<OutgoingGatePassReportRecord>[],
  sizeName: string,
  quantityMode: OutgoingQuantityMode,
) {
  return rows.reduce((total, row) => {
    return (
      total +
      row.original.orderDetails
        .filter((detail) => detail.size === sizeName)
        .reduce(
          (sum, detail) =>
            sum + (quantityMode === 'issued' ? detail.quantityIssued : detail.quantityAvailable),
          0,
        )
    );
  }, 0);
}

export function ReportTotalLabel() {
  return <span className="text-foreground text-sm font-semibold">Total</span>;
}

export function getOutgoingReportFooterContent(
  columnId: string,
  rows: readonly Row<OutgoingGatePassReportRecord>[],
  quantityMode: OutgoingQuantityMode,
) {
  if (columnId === 'totalBags') {
    const total = rows.reduce(
      (sum, row) => sum + (typeof row.original.totalBags === 'number' ? row.original.totalBags : 0),
      0,
    );

    return renderTotalValue(total);
  }

  if (!columnId.startsWith('size-')) {
    return null;
  }

  const total = sumOrderSizeQuantity(rows, columnId.replace(/^size-/, ''), quantityMode);

  return renderTotalValue(total);
}

export const outgoingReportFooterCellClassName = cn(
  'bg-muted/70 px-3 py-3 align-middle text-sm backdrop-blur-sm',
  'supports-[backdrop-filter]:bg-muted/60',
);
