import type { GatePassReportPdfRow } from '@/lib/gate-pass-report-pdf/types';

export const GATE_PASS_REPORT_ROWS_PER_PAGE = 36;
export const GATE_PASS_REPORT_LEDGER_ROWS_PER_PAGE = 28;

export function chunkGatePassReportRows(
  rows: GatePassReportPdfRow[],
  rowsPerPage = GATE_PASS_REPORT_ROWS_PER_PAGE,
): GatePassReportPdfRow[][] {
  if (rows.length === 0) return [[]];

  const pages: GatePassReportPdfRow[][] = [];

  for (let index = 0; index < rows.length; index += rowsPerPage) {
    pages.push(rows.slice(index, index + rowsPerPage));
  }

  return pages;
}
