import type { Table } from '@tanstack/react-table';

import type { TransferStockReportRecord } from '@/features/transfer-stock-report/api/types';
import {
  buildFilterSummaryLines,
  collectExportRows,
  exportCellValueToDisplay,
  formatDateRangeLabel,
  getColumnExportLabel,
  getExportCellForRow,
  getFilteredLeafRowCount,
  getFooterExportValue,
  isSummableExportColumn,
} from '@/features/transfer-stock-report/utils/export-cell-value';
import { buildTableReportPdfData } from '@/lib/gate-pass-report-pdf/build-table-report-pdf-data';
import type { GatePassReportPdfData } from '@/lib/gate-pass-report-pdf/types';

export type BuildTransferStockReportPdfDataInput = {
  table: Table<TransferStockReportRecord>;
  reportTitle?: string;
  dateFrom?: string;
  dateTo?: string;
  generatedAt?: Date;
};

export function buildTransferStockReportPdfData({
  table,
  reportTitle = 'Transfer Stock Report',
  dateFrom,
  dateTo,
  generatedAt,
}: BuildTransferStockReportPdfDataInput): GatePassReportPdfData {
  return buildTableReportPdfData({
    table,
    reportTitle,
    dateFrom,
    dateTo,
    generatedAt,
    formatDateRangeLabel,
    getFilteredLeafRowCount,
    buildFilterSummaryLines,
    collectExportRows,
    getColumnExportLabel,
    getExportCellForRow,
    getFooterExportValue,
    isSummableExportColumn,
    exportCellValueToDisplay,
  });
}
