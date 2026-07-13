import type { Table } from '@tanstack/react-table';

import type { IncomingGatePassReportRecord } from '@/features/incoming-report/api/types';
import type { IncomingQuantityMode } from '@/features/incoming-report/components/columns';
import {
  buildFilterSummaryLines,
  collectExportRows,
  computeIncomingReportFooterTotals,
  exportCellValueToDisplay,
  formatDateRangeLabel,
  getColumnExportLabel,
  getExportCellForRow,
  getFilteredLeafRowCount,
  getFooterExportValue,
  isSummableExportColumn,
} from '@/features/incoming-report/utils/export-cell-value';
import { mapIncomingSizeCellForPdf } from '@/features/incoming-report/utils/map-incoming-pdf-size-cell';
import { buildTableReportPdfData } from '@/lib/gate-pass-report-pdf/build-table-report-pdf-data';
import type { GatePassReportPdfData } from '@/lib/gate-pass-report-pdf/types';

export type BuildIncomingReportPdfDataInput = {
  table: Table<IncomingGatePassReportRecord>;
  quantityMode: IncomingQuantityMode;
  showLocation?: boolean;
  reportTitle?: string;
  dateFrom?: string;
  dateTo?: string;
  generatedAt?: Date;
};

export function buildIncomingReportPdfData({
  table,
  quantityMode,
  showLocation = true,
  reportTitle = 'Incoming Report',
  dateFrom,
  dateTo,
  generatedAt,
}: BuildIncomingReportPdfDataInput): GatePassReportPdfData {
  const filteredRows = table.getFilteredRowModel().rows;
  const footerValuesByColumnId = computeIncomingReportFooterTotals(filteredRows, quantityMode);

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
      getExportCellForRow: (row, column, cell) =>
        getExportCellForRow(row, column, quantityMode, cell, showLocation),
      getFooterExportValue: (columnId, rows) => getFooterExportValue(columnId, rows, quantityMode),
      isSummableExportColumn,
      exportCellValueToDisplay,
      mapExportCellToPdfCell: (row, exportCell, column, align) => {
        if (column.id.startsWith('size-') && !row.getIsGrouped()) {
          return mapIncomingSizeCellForPdf(
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
