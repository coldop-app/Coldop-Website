import type { Row } from '@tanstack/react-table';

import {
  getFarmerReportRowKey,
  type FarmerReportTableRow,
} from '@/features/people-report/utils/build-farmer-report-sections';

export function collectLeafRowsInDisplayOrder(
  tableRows: Row<FarmerReportTableRow>[],
): FarmerReportTableRow[] {
  const result: FarmerReportTableRow[] = [];
  const seen = new Set<string>();

  const walk = (rows: Row<FarmerReportTableRow>[]) => {
    for (const row of rows) {
      if (row.getIsGrouped()) {
        walk(row.subRows);
        continue;
      }

      const rowKey = getFarmerReportRowKey(row.original);
      if (seen.has(rowKey)) continue;

      seen.add(rowKey);
      result.push(row.original);
    }
  };

  walk(tableRows);
  return result;
}

export function getOrderedRowsForRunningTotals(
  pinnedRows: FarmerReportTableRow[],
  tableRows: Row<FarmerReportTableRow>[],
  isGroupingActive: boolean,
): FarmerReportTableRow[] {
  if (isGroupingActive) {
    return [...pinnedRows, ...collectLeafRowsInDisplayOrder(tableRows)];
  }

  return collectLeafRowsInDisplayOrder(tableRows);
}
