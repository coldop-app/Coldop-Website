import type { Row } from '@tanstack/react-table';

import type { TransferStockReportRecord } from '@/features/transfer-stock-report/api/types';
import { cn } from '@/lib/utils';

const numberFormatter = new Intl.NumberFormat('en-IN');

function formatTotalValue(value: number) {
  return numberFormatter.format(value);
}

function renderTotalValue(value: number) {
  return (
    <span className="text-foreground font-semibold tabular-nums">{formatTotalValue(value)}</span>
  );
}

function sumBagSizeQuantity(rows: readonly Row<TransferStockReportRecord>[], bagSizeName: string) {
  return rows.reduce((total, row) => {
    return (
      total +
      row.original.items
        .filter((item) => item.bagSize === bagSizeName)
        .reduce((sum, item) => sum + item.quantity, 0)
    );
  }, 0);
}

export function ReportTotalLabel() {
  return <span className="text-foreground text-sm font-semibold">Total</span>;
}

export function getTransferStockReportFooterContent(
  columnId: string,
  rows: readonly Row<TransferStockReportRecord>[],
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

  const total = sumBagSizeQuantity(rows, columnId.replace(/^size-/, ''));

  return renderTotalValue(total);
}

export const transferStockReportFooterCellClassName = cn(
  'bg-muted/70 px-3 py-3 align-middle text-sm backdrop-blur-sm',
  'supports-[backdrop-filter]:bg-muted/60',
);
