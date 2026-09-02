import { format } from 'date-fns';
import type { RowData } from '@tanstack/react-table';

import type {
  GatePassReportPdfCell,
  GatePassReportPdfData,
  GatePassReportPdfDisplayAlign,
  GatePassReportPdfTableVariant,
} from '@/lib/gate-pass-report-pdf/types';
import type { AppTable, AppRow, AppColumn, AppCell } from '@/lib/table/features';

type ExportCellValue =
  | { kind: 'text'; value: string }
  | { kind: 'number'; value: number; format: 'integer' }
  | { kind: 'empty' };

const INTEGER_FORMATTER = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
});

type PreparedPdfColumn<TRow extends RowData> = {
  column: AppColumn<TRow>;
  label: string;
  align: 'left' | 'right';
};

export type BuildTableReportPdfDataOptions<TRow extends RowData> = {
  table: AppTable<TRow>;
  reportTitle: string;
  dateFrom?: string;
  dateTo?: string;
  generatedAt?: Date;
  tableVariant?: GatePassReportPdfTableVariant;
  rowsPerPage?: number;
  formatDateRangeLabel: (dateFrom?: string, dateTo?: string) => string;
  getFilteredLeafRowCount: (table: AppTable<TRow>) => number;
  buildFilterSummaryLines: (table: AppTable<TRow>) => string[];
  collectExportRows: (table: AppTable<TRow>) => AppRow<TRow>[];
  getColumnExportLabel: (column: AppColumn<TRow>) => string;
  getExportCellForRow: (
    row: AppRow<TRow>,
    column: AppColumn<TRow>,
    cell?: AppCell<TRow>,
  ) => ExportCellValue;
  getFooterExportValue: (columnId: string, rows: readonly AppRow<TRow>[]) => ExportCellValue;
  isSummableExportColumn: (columnId: string) => boolean;
  exportCellValueToDisplay: (cell: ExportCellValue) => string;
  footerValuesByColumnId?: ReadonlyMap<string, ExportCellValue>;
  mapExportCellToPdfCell?: (
    row: AppRow<TRow>,
    exportCell: ExportCellValue,
    column: AppColumn<TRow>,
    align: 'left' | 'right',
  ) => GatePassReportPdfCell;
};

function toPdfCell(text: string, align: 'left' | 'right', isEmpty = false): GatePassReportPdfCell {
  return { text, align, isEmpty };
}

function cellFromExportValue(
  cell: ExportCellValue,
  align: 'left' | 'right',
): GatePassReportPdfCell {
  return toPdfCell(
    cell.kind === 'empty'
      ? '—'
      : cell.kind === 'number'
        ? INTEGER_FORMATTER.format(cell.value)
        : cell.value,
    align,
    cell.kind === 'empty',
  );
}

function defaultExportCellToPdfCell(
  exportCell: ExportCellValue,
  align: 'left' | 'right',
  exportCellValueToDisplay: (cell: ExportCellValue) => string,
): GatePassReportPdfCell {
  return toPdfCell(exportCellValueToDisplay(exportCell), align, exportCell.kind === 'empty');
}

function getLedgerDisplayAlign(
  columnId: string,
  align: 'left' | 'right',
): GatePassReportPdfDisplayAlign | undefined {
  if (columnId.startsWith('size-') || columnId === 'totalBags') {
    return 'center';
  }

  return align === 'right' ? 'right' : 'left';
}

function preparePdfColumns<TRow extends RowData>(
  visibleColumns: AppColumn<TRow>[],
  getColumnExportLabel: (column: AppColumn<TRow>) => string,
): PreparedPdfColumn<TRow>[] {
  return visibleColumns.map((column) => ({
    column,
    label: getColumnExportLabel(column),
    align: column.columnDef.meta?.align === 'right' ? 'right' : 'left',
  }));
}

function buildVisibleCellMap<TRow extends RowData>(row: AppRow<TRow>): Map<string, AppCell<TRow>> {
  const cellsByColumnId = new Map<string, AppCell<TRow>>();

  for (const cell of row.getVisibleCells()) {
    cellsByColumnId.set(cell.column.id, cell);
  }

  return cellsByColumnId;
}

export function buildTableReportPdfData<TRow extends RowData>({
  table,
  reportTitle,
  dateFrom,
  dateTo,
  generatedAt = new Date(),
  tableVariant = 'default',
  rowsPerPage,
  formatDateRangeLabel,
  getFilteredLeafRowCount,
  buildFilterSummaryLines,
  collectExportRows,
  getColumnExportLabel,
  getExportCellForRow,
  getFooterExportValue,
  isSummableExportColumn,
  exportCellValueToDisplay,
  footerValuesByColumnId,
  mapExportCellToPdfCell,
}: BuildTableReportPdfDataOptions<TRow>): GatePassReportPdfData {
  const visibleColumns = table.getVisibleLeafColumns();
  const preparedColumns = preparePdfColumns(visibleColumns, getColumnExportLabel);
  const exportRows = collectExportRows(table);
  const filteredLeafCount = getFilteredLeafRowCount(table);
  const filteredRows = table.getFilteredRowModel().rows;
  const filterSummaryLines = buildFilterSummaryLines(table);

  const columns = preparedColumns.map(({ column, label, align }) => ({
    label,
    align,
    columnId: column.id,
    displayAlign: tableVariant === 'ledger' ? getLedgerDisplayAlign(column.id, align) : undefined,
  }));

  const rows = exportRows.map((row) => {
    const cellsByColumnId = buildVisibleCellMap(row);

    return {
      isGroupRow: row.getIsGrouped(),
      cells: preparedColumns.map(({ column, align }) => {
        const exportCell = getExportCellForRow(row, column, cellsByColumnId.get(column.id));

        if (mapExportCellToPdfCell) {
          return mapExportCellToPdfCell(row, exportCell, column, align);
        }

        return defaultExportCellToPdfCell(exportCell, align, exportCellValueToDisplay);
      }),
    };
  });

  const footerCells = preparedColumns.map(({ column, align }, columnIndex) => {
    if (columnIndex === 0) {
      return toPdfCell('Total', align);
    }

    if (isSummableExportColumn(column.id)) {
      const exportCell =
        footerValuesByColumnId?.get(column.id) ?? getFooterExportValue(column.id, filteredRows);

      return cellFromExportValue(exportCell, align);
    }

    return toPdfCell('', align, true);
  });

  const entryCountLabel = `${filteredLeafCount.toLocaleString('en-IN')} ${
    filteredLeafCount === 1 ? 'entry' : 'entries'
  }`;

  return {
    reportTitle,
    generatedAt,
    periodLabel: formatDateRangeLabel(dateFrom, dateTo),
    entryCountLabel,
    filterSummaryLines,
    columns,
    rows,
    footerCells,
    tableVariant,
    rowsPerPage,
  };
}

export function formatGatePassReportGeneratedAt(date: Date): string {
  return format(date, 'do MMM yyyy, h:mm a');
}
