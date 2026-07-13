import type { GroupingState, Table } from '@tanstack/react-table';

import { parseDateParam } from '@/features/people/search';
import type { FarmerReportTableRow } from '@/features/people-report/utils/build-farmer-report-sections';
import { buildFilterSummaryLines } from '@/features/people-report/utils/export-cell-value';
import {
  FARMER_REPORT_GROUP_COLUMN_IDS,
  type FarmerReportGroupColumnId,
} from '@/features/people-report/utils/report-grouping';

const GROUP_COLUMN_LABELS: Record<FarmerReportGroupColumnId, string> = {
  [FARMER_REPORT_GROUP_COLUMN_IDS.variety]: 'Variety',
  [FARMER_REPORT_GROUP_COLUMN_IDS.stockFilter]: 'Stock Filter',
};

function formatDisplayDate(value?: string): string | undefined {
  const date = parseDateParam(value);
  if (!date) return undefined;

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function buildFarmerReportDateRangeSummary(
  appliedFrom?: string,
  appliedTo?: string,
): string {
  const fromLabel = formatDisplayDate(appliedFrom);
  const toLabel = formatDisplayDate(appliedTo);

  if (fromLabel && toLabel) {
    return `Date range: ${fromLabel} to ${toLabel}`;
  }

  if (fromLabel) {
    return `Date range: from ${fromLabel}`;
  }

  if (toLabel) {
    return `Date range: up to ${toLabel}`;
  }

  return 'Date range: All dates';
}

export function buildFarmerReportGroupingSummary(grouping: GroupingState): string | null {
  const labels = grouping
    .filter(
      (columnId): columnId is FarmerReportGroupColumnId =>
        columnId === FARMER_REPORT_GROUP_COLUMN_IDS.variety ||
        columnId === FARMER_REPORT_GROUP_COLUMN_IDS.stockFilter,
    )
    .map((columnId) => GROUP_COLUMN_LABELS[columnId]);

  if (labels.length === 0) return null;

  return `Grouped by: ${labels.join(', ')}`;
}

export function buildFarmerReportFilterSummaryLines({
  appliedFrom,
  appliedTo,
  grouping,
  viewTable,
}: {
  appliedFrom?: string;
  appliedTo?: string;
  grouping: GroupingState;
  viewTable?: Table<FarmerReportTableRow> | null;
}): string[] {
  const lines = [buildFarmerReportDateRangeSummary(appliedFrom, appliedTo)];

  if (viewTable) {
    lines.push(...buildFilterSummaryLines(viewTable));
  } else {
    const groupingSummary = buildFarmerReportGroupingSummary(grouping);
    if (groupingSummary) {
      lines.push(groupingSummary);
    }
  }

  return lines;
}
