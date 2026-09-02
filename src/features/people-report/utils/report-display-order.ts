import {
  getFarmerReportRowKey,
  type FarmerReportTableRow,
} from '@/features/people-report/utils/build-farmer-report-sections';
import type { AppRow } from '@/lib/table/features';

export function collectLeafRowsInDisplayOrder(
  tableRows: AppRow<FarmerReportTableRow>[],
): FarmerReportTableRow[] {
  const result: FarmerReportTableRow[] = [];
  const seen = new Set<string>();

  const walk = (rows: AppRow<FarmerReportTableRow>[]) => {
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
  tableRows: AppRow<FarmerReportTableRow>[],
  isGroupingActive: boolean,
): FarmerReportTableRow[] {
  if (isGroupingActive) {
    return [...pinnedRows, ...collectLeafRowsInDisplayOrder(tableRows)];
  }

  return collectLeafRowsInDisplayOrder(tableRows);
}
