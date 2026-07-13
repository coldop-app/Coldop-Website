import { format } from 'date-fns';
import type ExcelJS from 'exceljs';
import type { Table } from '@tanstack/react-table';

import type { TransferStockReportRecord } from '@/features/transfer-stock-report/api/types';
import {
  buildFilterSummaryLines,
  collectExportRows,
  exportCellValueToPrimitive,
  formatDateRangeLabel,
  getColumnExportLabel,
  getExcelNumFmt,
  getExportCellForRow,
  getFilteredLeafRowCount,
  getFooterExportValue,
  isSummableExportColumn,
  type ExportCellValue,
} from '@/features/transfer-stock-report/utils/export-cell-value';
import { downloadBlob } from '@/lib/download-blob';
import { COLDOP_BRANDING, EXPORT_THEME_COLORS } from '@/lib/export-report-theme';
import { loadExcelJS } from '@/lib/load-exceljs';

const COLORS = EXPORT_THEME_COLORS;

const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: COLORS.border } },
  left: { style: 'thin', color: { argb: COLORS.border } },
  bottom: { style: 'thin', color: { argb: COLORS.border } },
  right: { style: 'thin', color: { argb: COLORS.border } },
};

const titleStyle: Partial<ExcelJS.Style> = {
  font: {
    name: 'Calibri',
    size: 16,
    bold: true,
    color: { argb: COLORS.primary },
  },
  alignment: { vertical: 'middle', horizontal: 'left' },
};

const reportTitleStyle: Partial<ExcelJS.Style> = {
  font: {
    name: 'Calibri',
    size: 13,
    bold: true,
    color: { argb: COLORS.primary },
  },
  alignment: { vertical: 'middle', horizontal: 'left' },
};

const metadataStyle: Partial<ExcelJS.Style> = {
  font: { name: 'Calibri', size: 10, color: { argb: COLORS.mutedForeground } },
  alignment: { vertical: 'middle', horizontal: 'left', wrapText: true },
};

const filterSummaryStyle: Partial<ExcelJS.Style> = {
  font: { name: 'Calibri', size: 10, color: { argb: COLORS.mutedForeground } },
  alignment: { vertical: 'top', horizontal: 'left', wrapText: true },
};

const brandingStyle: Partial<ExcelJS.Style> = {
  font: { name: 'Calibri', size: 9, color: { argb: COLORS.mutedForeground } },
  alignment: { vertical: 'middle', horizontal: 'left' },
};

function createTableHeaderStyle(align: 'left' | 'right'): Partial<ExcelJS.Style> {
  return {
    font: {
      name: 'Calibri',
      size: 10,
      bold: true,
      color: { argb: COLORS.primary },
    },
    fill: {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: COLORS.mutedFill },
    },
    border: THIN_BORDER,
    alignment: {
      vertical: 'middle',
      horizontal: align,
      wrapText: true,
    },
  };
}

function createBodyStyle(options: {
  align: 'left' | 'right';
  fillArgb?: string;
  bold?: boolean;
  fontColorArgb?: string;
  numFmt?: string;
}): Partial<ExcelJS.Style> {
  return {
    font: {
      name: 'Calibri',
      size: 10,
      bold: options.bold ?? false,
      color: { argb: options.fontColorArgb ?? COLORS.foreground },
    },
    fill: options.fillArgb
      ? {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: options.fillArgb },
        }
      : undefined,
    border: THIN_BORDER,
    alignment: {
      vertical: 'top',
      horizontal: options.align,
      wrapText: true,
    },
    numFmt: options.numFmt,
  };
}

function createTotalStyle(align: 'left' | 'right', numFmt?: string): Partial<ExcelJS.Style> {
  return {
    font: {
      name: 'Calibri',
      size: 10,
      bold: true,
      color: { argb: COLORS.primary },
    },
    fill: {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: COLORS.primarySoftFill },
    },
    border: THIN_BORDER,
    alignment: { vertical: 'middle', horizontal: align },
    numFmt,
  };
}

function columnIndexToLetter(index: number): string {
  let letter = '';
  let current = index;

  while (current > 0) {
    const remainder = (current - 1) % 26;
    letter = String.fromCharCode(65 + remainder) + letter;
    current = Math.floor((current - 1) / 26);
  }

  return letter;
}

function sanitizeFilename(value: string): string {
  return value.replace(/[^\w.-]+/g, '-').replace(/-+/g, '-');
}

function applyStyleToRow(row: ExcelJS.Row, style: Partial<ExcelJS.Style>, columnCount: number) {
  for (let index = 1; index <= columnCount; index += 1) {
    Object.assign(row.getCell(index), { style });
  }
}

function applyCellStyle(
  cell: ExcelJS.Cell,
  exportCell: ExportCellValue,
  options: {
    align: 'left' | 'right';
    fillArgb?: string;
    bold?: boolean;
    fontColorArgb?: string;
  },
) {
  const numFmt = exportCell.kind === 'number' ? getExcelNumFmt() : undefined;

  Object.assign(cell, {
    style: createBodyStyle({
      align: options.align,
      fillArgb: options.fillArgb,
      bold: options.bold,
      fontColorArgb: options.fontColorArgb,
      numFmt,
    }),
  });
}

function applyBrandingToCell(cell: ExcelJS.Cell) {
  cell.value = {
    richText: [
      {
        font: {
          name: 'Calibri',
          size: 9,
          color: { argb: COLORS.mutedForeground },
        },
        text: COLDOP_BRANDING.label,
      },
      {
        font: {
          name: 'Calibri',
          size: 9,
          bold: true,
          color: { argb: COLORS.primary },
        },
        text: COLDOP_BRANDING.name,
      },
    ],
  };
  cell.style = brandingStyle;
}

function autoFitColumns(worksheet: ExcelJS.Worksheet, columnCount: number, maxWidth = 40) {
  for (let index = 1; index <= columnCount; index += 1) {
    const column = worksheet.getColumn(index);
    let maxLength = 10;

    column.eachCell({ includeEmpty: false }, (cell) => {
      const value = cell.value;
      const text =
        value == null
          ? ''
          : typeof value === 'object' && 'text' in value
            ? String(value.text)
            : String(value);
      maxLength = Math.max(maxLength, Math.min(text.length + 2, maxWidth));
    });

    column.width = maxLength;
  }
}

export type ExportTransferStockReportOptions = {
  table: Table<TransferStockReportRecord>;
  coldStorageName: string;
  reportTitle?: string;
  dateFrom?: string;
  dateTo?: string;
  generatedAt?: Date;
};

export async function exportTransferStockReportToExcel({
  table,
  coldStorageName,
  reportTitle = 'Transfer Stock Report',
  dateFrom,
  dateTo,
  generatedAt = new Date(),
}: ExportTransferStockReportOptions): Promise<void> {
  const ExcelJS = await loadExcelJS();
  const visibleColumns = table.getVisibleLeafColumns();
  const columnCount = Math.max(visibleColumns.length, 1);
  const lastColumnLetter = columnIndexToLetter(columnCount);
  const exportRows = collectExportRows(table);
  const filteredLeafCount = getFilteredLeafRowCount(table);
  const filterSummaryLines = buildFilterSummaryLines(table);
  const filteredRows = table.getFilteredRowModel().rows;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = coldStorageName;
  workbook.company = COLDOP_BRANDING.name;
  workbook.created = generatedAt;

  const worksheet = workbook.addWorksheet('Transfer Stock Report', {
    views: [{ showGridLines: false }],
  });

  worksheet.mergeCells(`A1:${lastColumnLetter}1`);
  const titleRow = worksheet.getRow(1);
  titleRow.height = 28;
  titleRow.getCell(1).value = coldStorageName;
  applyStyleToRow(titleRow, titleStyle, columnCount);

  worksheet.mergeCells(`A2:${lastColumnLetter}2`);
  const reportRow = worksheet.getRow(2);
  reportRow.height = 22;
  reportRow.getCell(1).value = reportTitle;
  applyStyleToRow(reportRow, reportTitleStyle, columnCount);

  const metadataText = [
    `Generated: ${format(generatedAt, 'do MMM yyyy, h:mm a')}`,
    `Period: ${formatDateRangeLabel(dateFrom, dateTo)}`,
    `${filteredLeafCount.toLocaleString('en-IN')} ${filteredLeafCount === 1 ? 'entry' : 'entries'}`,
  ].join('  |  ');

  worksheet.mergeCells(`A3:${lastColumnLetter}3`);
  const metadataRow = worksheet.getRow(3);
  metadataRow.height = 18;
  metadataRow.getCell(1).value = metadataText;
  applyStyleToRow(metadataRow, metadataStyle, columnCount);

  worksheet.mergeCells(`A4:${lastColumnLetter}4`);
  const filterRow = worksheet.getRow(4);
  filterRow.height = filterSummaryLines.length > 0 ? 36 : 14;
  filterRow.getCell(1).value =
    filterSummaryLines.length > 0 ? filterSummaryLines.join('\n') : 'Filters: none applied';
  applyStyleToRow(filterRow, filterSummaryStyle, columnCount);

  worksheet.mergeCells(`A5:${lastColumnLetter}5`);
  const brandingHeaderRow = worksheet.getRow(5);
  brandingHeaderRow.height = 16;
  applyBrandingToCell(brandingHeaderRow.getCell(1));

  worksheet.getRow(6).height = 8;

  const headerRowIndex = 7;
  const headerRow = worksheet.getRow(headerRowIndex);
  headerRow.height = 22;

  visibleColumns.forEach((column, index) => {
    const align = column.columnDef.meta?.align === 'right' ? 'right' : 'left';
    const cell = headerRow.getCell(index + 1);
    cell.value = getColumnExportLabel(column);
    cell.style = createTableHeaderStyle(align);
  });

  let currentRowIndex = headerRowIndex + 1;
  let dataRowCounter = 0;

  for (const row of exportRows) {
    const isGroupRow = row.getIsGrouped();
    const excelRow = worksheet.getRow(currentRowIndex);
    excelRow.height = isGroupRow ? 20 : 18;

    visibleColumns.forEach((column, columnIndex) => {
      const align = column.columnDef.meta?.align === 'right' ? 'right' : 'left';
      const exportCell = getExportCellForRow(row, column);
      const cell = excelRow.getCell(columnIndex + 1);
      cell.value = exportCellValueToPrimitive(exportCell);

      const fillArgb = isGroupRow
        ? COLORS.primaryMutedFill
        : dataRowCounter % 2 === 1
          ? COLORS.zebraFill
          : undefined;

      applyCellStyle(cell, exportCell, {
        align,
        fillArgb,
        bold: isGroupRow && exportCell.kind === 'text',
        fontColorArgb: isGroupRow && exportCell.kind === 'text' ? COLORS.primary : undefined,
      });
    });

    if (!isGroupRow) {
      dataRowCounter += 1;
    }

    currentRowIndex += 1;
  }

  const totalsRowIndex = currentRowIndex;
  const totalsRow = worksheet.getRow(totalsRowIndex);
  totalsRow.height = 22;

  visibleColumns.forEach((column, columnIndex) => {
    const columnId = column.id;
    const align = column.columnDef.meta?.align === 'right' ? 'right' : 'left';
    const cell = totalsRow.getCell(columnIndex + 1);

    if (columnIndex === 0) {
      cell.value = 'Total';
      cell.style = createTotalStyle('left');
      return;
    }

    if (isSummableExportColumn(columnId)) {
      const exportCell = getFooterExportValue(columnId, filteredRows);
      const numFmt = exportCell.kind === 'number' ? getExcelNumFmt() : undefined;

      cell.value = exportCellValueToPrimitive(exportCell);
      cell.style = createTotalStyle(align, numFmt);
      return;
    }

    cell.value = '';
    cell.style = createTotalStyle(align);
  });

  worksheet.views = [
    {
      state: 'frozen',
      ySplit: headerRowIndex,
      showGridLines: false,
    },
  ];

  worksheet.autoFilter = {
    from: `A${headerRowIndex}`,
    to: `${lastColumnLetter}${Math.max(totalsRowIndex - 1, headerRowIndex)}`,
  };

  worksheet.pageSetup = {
    paperSize: 9,
    orientation: 'landscape',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    margins: {
      left: 0.4,
      right: 0.4,
      top: 0.5,
      bottom: 0.5,
      header: 0.2,
      footer: 0.2,
    },
  };

  worksheet.headerFooter.oddFooter = `&C${COLDOP_BRANDING.label}&"Calibri,Bold"${COLDOP_BRANDING.name}`;

  autoFitColumns(worksheet, columnCount);

  const buffer = await workbook.xlsx.writeBuffer();
  const filename = sanitizeFilename(
    `transfer-stock-report_${format(generatedAt, 'yyyy-MM-dd')}.xlsx`,
  );

  downloadBlob(
    new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    filename,
  );
}
