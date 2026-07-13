import type { GroupingState } from '@tanstack/react-table';

export const FARMER_REPORT_GROUP_COLUMN_IDS = {
  variety: 'variety',
  stockFilter: 'stockFilter',
} as const;

export type FarmerReportGroupColumnId =
  (typeof FARMER_REPORT_GROUP_COLUMN_IDS)[keyof typeof FARMER_REPORT_GROUP_COLUMN_IDS];

export function toggleFarmerReportGrouping(
  grouping: GroupingState,
  columnId: FarmerReportGroupColumnId,
): GroupingState {
  const index = grouping.indexOf(columnId);
  if (index >= 0) {
    return grouping.filter((id) => id !== columnId);
  }

  return [...grouping, columnId];
}

export function isFarmerReportGrouped(
  grouping: GroupingState,
  columnId: FarmerReportGroupColumnId,
): boolean {
  return grouping.includes(columnId);
}
