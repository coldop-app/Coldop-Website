import type {
  AnalyticsStockVariety,
  AnalyticsSummaryByFilterData,
  AnalyticsSummaryData,
} from '@/features/analytics/types';
import { getAnalyticsQuantityForMode } from '@/features/analytics/utils/get-analytics-quantity-for-mode';
import type {
  StockQuantityMode,
  StockSummaryMatrix,
  StockSummaryRow,
} from '@/features/people/utils/build-farmer-stock-summary';

export type BuildAnalyticsStockSummaryInput = {
  stockSummary: AnalyticsStockVariety[];
  sizeOrder?: string[];
  quantityMode: StockQuantityMode;
};

function resolveSizeColumns(stockSummary: AnalyticsStockVariety[], sizeOrder?: string[]): string[] {
  if (sizeOrder && sizeOrder.length > 0) {
    const seen = new Set(sizeOrder);
    const extra = new Set<string>();

    for (const variety of stockSummary) {
      for (const size of variety.sizes) {
        const name = size.size.trim();
        if (name && !seen.has(name)) extra.add(name);
      }
    }

    return [...sizeOrder, ...[...extra].sort((a, b) => a.localeCompare(b))];
  }

  const sizes = new Set<string>();
  for (const variety of stockSummary) {
    for (const size of variety.sizes) {
      const name = size.size.trim();
      if (name) sizes.add(name);
    }
  }

  return [...sizes].sort((a, b) => a.localeCompare(b));
}

function buildMatrixForMode(
  stockSummary: AnalyticsStockVariety[],
  sizeColumns: string[],
  mode: StockQuantityMode,
): Pick<StockSummaryMatrix, 'rows' | 'footerBySize' | 'grandTotal'> {
  const rows: StockSummaryRow[] = stockSummary
    .map((variety) => {
      const varietyName = variety.variety.trim() || '—';
      const bySize = Object.fromEntries(
        sizeColumns.map((size) => {
          const match = variety.sizes.find((entry) => entry.size.trim() === size);
          const quantity = match
            ? getAnalyticsQuantityForMode(match.initialQuantity, match.currentQuantity, mode)
            : 0;
          return [size, quantity];
        }),
      );
      const total = sizeColumns.reduce((sum, size) => sum + (bySize[size] ?? 0), 0);

      return { variety: varietyName, bySize, total };
    })
    .filter((row) => row.total > 0)
    .sort((a, b) => a.variety.localeCompare(b.variety));

  const footerBySize = Object.fromEntries(
    sizeColumns.map((size) => [size, rows.reduce((sum, row) => sum + (row.bySize[size] ?? 0), 0)]),
  );

  const grandTotal = rows.reduce((sum, row) => sum + row.total, 0);

  return { rows, footerBySize, grandTotal };
}

export function isAnalyticsSummaryData(
  data: AnalyticsSummaryData | AnalyticsSummaryByFilterData,
): data is AnalyticsSummaryData {
  return 'stockSummary' in data;
}

export function buildAnalyticsStockSummary({
  stockSummary,
  sizeOrder,
  quantityMode,
}: BuildAnalyticsStockSummaryInput): StockSummaryMatrix {
  const sizeColumns = resolveSizeColumns(stockSummary, sizeOrder);

  const modeTotals = {
    current: buildMatrixForMode(stockSummary, sizeColumns, 'current').grandTotal,
    initial: buildMatrixForMode(stockSummary, sizeColumns, 'initial').grandTotal,
    outgoing: buildMatrixForMode(stockSummary, sizeColumns, 'outgoing').grandTotal,
  };

  const { rows, footerBySize, grandTotal } = buildMatrixForMode(
    stockSummary,
    sizeColumns,
    quantityMode,
  );

  return {
    sizeColumns,
    rows,
    footerBySize,
    grandTotal,
    modeTotals,
  };
}
