import type { Row } from '@tanstack/react-table';

import type { IncomingGatePassReportRecord } from '@/features/incoming-report/api/types';
import { cn } from '@/lib/utils';

import { getIncomingReportTotalBags, type IncomingQuantityMode } from './columns';

const numberFormatter = new Intl.NumberFormat('en-IN');

function formatTotalValue(value: number) {
  return numberFormatter.format(value);
}

function renderTotalValue(value: number) {
  return (
    <span className="text-foreground font-semibold tabular-nums">{formatTotalValue(value)}</span>
  );
}

function sumBagSizeQuantity(
  rows: readonly Row<IncomingGatePassReportRecord>[],
  sizeName: string,
  quantityMode: IncomingQuantityMode,
) {
  return rows.reduce((total, row) => {
    return (
      total +
      row.original.bagSizes
        .filter((bag) => bag.name === sizeName)
        .reduce(
          (sum, bag) =>
            sum + (quantityMode === 'current' ? bag.currentQuantity : bag.initialQuantity),
          0,
        )
    );
  }, 0);
}

export function ReportTotalLabel() {
  return <span className="text-foreground text-sm font-semibold">Total</span>;
}

export function getIncomingReportFooterContent(
  columnId: string,
  rows: readonly Row<IncomingGatePassReportRecord>[],
  quantityMode: IncomingQuantityMode,
) {
  if (columnId === 'totalBags') {
    const total = rows.reduce(
      (sum, row) => sum + getIncomingReportTotalBags(row.original, quantityMode),
      0,
    );

    return renderTotalValue(total);
  }

  if (!columnId.startsWith('size-')) {
    return null;
  }

  const total = sumBagSizeQuantity(rows, columnId.replace(/^size-/, ''), quantityMode);

  return renderTotalValue(total);
}

export const incomingReportFooterCellClassName = cn(
  'bg-muted/70 px-3 py-3 align-middle text-sm backdrop-blur-sm',
  'supports-[backdrop-filter]:bg-muted/60',
);
