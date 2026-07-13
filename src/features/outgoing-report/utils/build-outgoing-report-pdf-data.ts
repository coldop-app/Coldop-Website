import type { Table } from '@tanstack/react-table';

import type { OutgoingGatePassReportRecord } from '@/features/outgoing-report/api/types';
import type { OutgoingQuantityMode } from '@/features/outgoing-report/components/columns';
import {
  buildFilterSummaryLines,
  collectExportRows,
  computeOutgoingReportFooterTotals,
  exportCellValueToDisplay,
  formatDateRangeLabel,
  getColumnExportLabel,
  getExportCellForRow,
  getFilteredLeafRowCount,
  getFooterExportValue,
  isSummableExportColumn,
} from '@/features/outgoing-report/utils/export-cell-value';
import { mapOutgoingSizeCellForPdf } from '@/features/outgoing-report/utils/map-outgoing-pdf-size-cell';
import { buildTableReportPdfData } from '@/lib/gate-pass-report-pdf/build-table-report-pdf-data';
import type { GatePassReportPdfData } from '@/lib/gate-pass-report-pdf/types';

export type BuildOutgoingReportPdfDataInput = {
  table: Table<OutgoingGatePassReportRecord>;
  quantityMode: OutgoingQuantityMode;
  showLocation?: boolean;
  reportTitle?: string;
  dateFrom?: string;
  dateTo?: string;
  generatedAt?: Date;
};

export function buildOutgoingReportPdfData({
  table,
  quantityMode,
  showLocation = true,
  reportTitle = 'Outgoing Report',
  dateFrom,
  dateTo,
  generatedAt,
}: BuildOutgoingReportPdfDataInput): GatePassReportPdfData {
  const filteredRows = table.getFilteredRowModel().rows;
  const footerValuesByColumnId = computeOutgoingReportFooterTotals(filteredRows, quantityMode);

  return {
    ...buildTableReportPdfData({
      table,
      reportTitle,
      dateFrom,
      dateTo,
      generatedAt,
      tableVariant: 'ledger',
      formatDateRangeLabel,
      getFilteredLeafRowCount,
      buildFilterSummaryLines: (reportTable) =>
        buildFilterSummaryLines(reportTable, quantityMode, showLocation),
      collectExportRows,
      getColumnExportLabel,
      footerValuesByColumnId,
      getExportCellForRow: (row, column) =>
        getExportCellForRow(row, column, quantityMode, showLocation),
      getFooterExportValue: (columnId, rows) => getFooterExportValue(columnId, rows, quantityMode),
      isSummableExportColumn,
      exportCellValueToDisplay,
      mapExportCellToPdfCell: (row, exportCell, column, align) => {
        if (column.id.startsWith('size-') && !row.getIsGrouped()) {
          return mapOutgoingSizeCellForPdf(
            row.original,
            column.id,
            quantityMode,
            showLocation,
            align,
          );
        }

        return {
          text: exportCellValueToDisplay(exportCell),
          align,
          isEmpty: exportCell.kind === 'empty',
        };
      },
    }),
    keepRowsTogether: true,
    continuousPages: true,
  };
}
