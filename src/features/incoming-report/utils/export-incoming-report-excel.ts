import { format } from 'date-fns';
import type ExcelJS from 'exceljs';
import type { Table } from '@tanstack/react-table';

import type { IncomingGatePassReportRecord } from '@/features/incoming-report/api/types';
import type { IncomingQuantityMode } from '@/features/incoming-report/components/columns';
import {
  buildFilterSummaryLines,
  collectExportRows,
  exportCellValueToPrimitive,
  formatDateRangeLabel,
  getColumnExportLabel,
  getExportCellForRow,
  getFilteredLeafRowCount,
  getFooterExportValue,
  isSummableExportColumn,
} from '@/features/incoming-report/utils/export-cell-value';
import { downloadBlob } from '@/lib/download-blob';
import {
  COLDOP_BRANDING,
  EXPORT_INTEGER_NUM_FMT,
  EXPORT_THEME_COLORS,
} from '@/lib/export-report-theme';
import type { ExcelPreviewRow } from '@/lib/excel-preview-tab';
import { loadExcelJS } from '@/lib/load-exceljs';

const COLORS = EXPORT_THEME_COLORS;

const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: COLORS.border } },
  left: { style: 'thin', color: { argb: COLORS.border } },
  bottom: { style: 'thin', color: { argb: COLORS.border } },
  right: { style: 'thin', color: { argb: COLORS.border } },
};

const HEADER_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: COLORS.border } },
  left: { style: 'thin', color: { argb: COLORS.border } },
  bottom: { style: 'medium', color: { argb: COLORS.border } },
  right: { style: 'thin', color: { argb: COLORS.border } },
};

const TOTAL_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: 'medium', color: { argb: COLORS.border } },
  left: { style: 'thin', color: { argb: COLORS.border } },
  bottom: { style: 'thin', color: { argb: COLORS.border } },
  right: { style: 'thin', color: { argb: COLORS.border } },
};

const FILLS = {
  group: {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: COLORS.primaryMutedFill },
  } satisfies ExcelJS.Fill,
  section: {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: COLORS.primarySoftFill },
  } satisfies ExcelJS.Fill,
  header: {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: COLORS.mutedFill },
  } satisfies ExcelJS.Fill,
  total: {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: COLORS.primarySoftFill },
  } satisfies ExcelJS.Fill,
};

const ALIGN_CENTER = {
  horizontal: 'center',
  vertical: 'middle',
  wrapText: true,
} satisfies Partial<ExcelJS.Alignment>;

const ALIGN_HEADER_LEFT = {
  horizontal: 'left',
  vertical: 'middle',
  wrapText: true,
} satisfies Partial<ExcelJS.Alignment>;

const ALIGN_FILTER_LEFT = {
  horizontal: 'left',
  vertical: 'top',
  wrapText: true,
} satisfies Partial<ExcelJS.Alignment>;

const COLUMN_WIDTHS: Record<string, number> = {
  name: 18,
  address: 22,
  accountNumber: 12,
  gatePassNo: 11,
  manualParchiNumber: 14,
  date: 14,
  variety: 12,
  stockFilter: 10,
  customMarka: 10,
  totalBags: 11,
  createdBy: 14,
  remarks: 16,
};

const DEFAULT_COLUMN_WIDTH = 12;
const SIZE_COLUMN_WIDTH = 14;
const ROW_LINE_HEIGHT = 15;
const MIN_BODY_ROW_HEIGHT = 18;

function bodyFont(bold = false, colorArgb: string = COLORS.foreground): Partial<ExcelJS.Font> {
  return {
    name: 'Calibri',
    size: 10,
    bold,
    color: { argb: colorArgb },
  };
}

function headerFont(): Partial<ExcelJS.Font> {
  return {
    name: 'Calibri',
    size: 10,
    bold: true,
    color: { argb: COLORS.primary },
  };
}

function titleFont(size: number): Partial<ExcelJS.Font> {
  return {
    name: 'Calibri',
    size,
    bold: true,
    color: { argb: COLORS.primary },
  };
}

function metadataFont(): Partial<ExcelJS.Font> {
  return {
    name: 'Calibri',
    size: 10,
    color: { argb: COLORS.mutedForeground },
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

function getColumnWidths(columnIds: string[]): number[] {
  return columnIds.map((columnId) => {
    if (columnId.startsWith('size-')) return SIZE_COLUMN_WIDTH;
    return COLUMN_WIDTHS[columnId] ?? DEFAULT_COLUMN_WIDTH;
  });
}

function estimateWrappedLineCount(text: string, columnWidth: number): number {
  const charsPerLine = Math.max(4, Math.floor(columnWidth));
  return text.split('\n').reduce((total, line) => {
    if (line.length === 0) return total + 1;
    return total + Math.ceil(line.length / charsPerLine);
  }, 0);
}

function calculateBodyRowHeight(values: Array<string | number>, columnWidths: number[]): number {
  let maxLines = 1;

  for (let index = 0; index < values.length; index++) {
    const value = values[index];
    if (typeof value !== 'string' || value === '' || value === '—') continue;

    const lines = estimateWrappedLineCount(value, columnWidths[index] ?? DEFAULT_COLUMN_WIDTH);
    maxLines = Math.max(maxLines, lines);
  }

  return Math.max(MIN_BODY_ROW_HEIGHT, maxLines * ROW_LINE_HEIGHT + 3);
}

function createSectionTitleRow(title: string, columnCount: number): ExcelPreviewRow {
  return {
    values: [title, ...Array(Math.max(0, columnCount - 1)).fill('')],
    boldByColumn: Array(columnCount).fill(true),
    isGroupedOrAggregatedRow: false,
    isSectionTitle: true,
  };
}

function createTotalsBodyRow(values: Array<string | number>): ExcelPreviewRow {
  return {
    values,
    boldByColumn: Array(values.length).fill(true),
    isGroupedOrAggregatedRow: true,
    isTotalsRow: true,
  };
}

function styleHeaderCells(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.fill = FILLS.header;
    cell.border = HEADER_BORDER;
    cell.font = headerFont() as ExcelJS.Font;
    cell.alignment = ALIGN_CENTER;
  });
}

function styleBodyRow(
  excelRow: ExcelJS.Row,
  dataRow: ExcelPreviewRow,
  columnCount: number,
  columnWidths: number[],
) {
  excelRow.height = calculateBodyRowHeight(dataRow.values, columnWidths);

  const rowFill = dataRow.isSectionTitle
    ? FILLS.section
    : dataRow.isTotalsRow
      ? FILLS.total
      : dataRow.isGroupedOrAggregatedRow
        ? FILLS.group
        : undefined;

  for (let columnNumber = 1; columnNumber <= columnCount; columnNumber++) {
    const cell = excelRow.getCell(columnNumber);
    if (rowFill) {
      cell.fill = rowFill;
    }
    cell.border = dataRow.isTotalsRow ? TOTAL_BORDER : THIN_BORDER;

    const isBold =
      dataRow.isSectionTitle ||
      dataRow.isTotalsRow ||
      dataRow.boldByColumn?.[columnNumber - 1] === true;
    const isGroupLabel =
      dataRow.isGroupedOrAggregatedRow &&
      !dataRow.isSectionTitle &&
      !dataRow.isTotalsRow &&
      columnNumber === 1;

    cell.font = (
      dataRow.isSectionTitle || dataRow.isTotalsRow || isGroupLabel
        ? bodyFont(true, COLORS.primary)
        : isBold
          ? bodyFont(true)
          : bodyFont()
    ) as ExcelJS.Font;

    const cellValue = dataRow.values[columnNumber - 1];
    cell.alignment = ALIGN_CENTER;
    if (typeof cellValue === 'number') {
      cell.numFmt = EXPORT_INTEGER_NUM_FMT;
    }
  }
}

function addColumnHeaderRow(worksheet: ExcelJS.Worksheet, headers: string[]) {
  const row = worksheet.addRow(headers);
  row.height = 22;
  styleHeaderCells(row);
  return row;
}

function addBodyRow(
  worksheet: ExcelJS.Worksheet,
  dataRow: ExcelPreviewRow,
  columnCount: number,
  columnWidths: number[],
) {
  const excelRow = worksheet.addRow(dataRow.values);
  styleBodyRow(excelRow, dataRow, columnCount, columnWidths);
}

function addStyledBodyRows(
  worksheet: ExcelJS.Worksheet,
  dataRows: ExcelPreviewRow[],
  columnCount: number,
  columnWidths: number[],
) {
  if (dataRows.length === 0) return;

  const excelRows = worksheet.addRows(dataRows.map((row) => row.values));

  for (let index = 0; index < dataRows.length; index++) {
    const dataRow = dataRows[index]!;
    styleBodyRow(excelRows[index]!, dataRow, columnCount, columnWidths);
  }
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
  cell.font = metadataFont() as ExcelJS.Font;
  cell.alignment = ALIGN_HEADER_LEFT;
}

export type BuildIncomingReportExcelInput = {
  table: Table<IncomingGatePassReportRecord>;
  coldStorageName: string;
  quantityMode: IncomingQuantityMode;
  showLocation?: boolean;
  reportTitle?: string;
  dateFrom?: string;
  dateTo?: string;
  generatedAt?: Date;
};

export type IncomingReportPreviewData = {
  title: string;
  subtitle: string;
  exportedRowCount: number;
  headers: string[];
  rows: ExcelPreviewRow[];
  metaLines: string[];
  filterSummaryLines: string[];
  fileName: string;
};

export type IncomingReportExcelPackage = {
  buffer: ArrayBuffer;
  fileName: string;
  preview: IncomingReportPreviewData;
};

export function buildIncomingReportPreviewData({
  table,
  coldStorageName,
  quantityMode,
  showLocation = true,
  reportTitle = 'Incoming Report',
  dateFrom,
  dateTo,
  generatedAt = new Date(),
}: BuildIncomingReportExcelInput): IncomingReportPreviewData {
  const visibleColumns = table.getVisibleLeafColumns();
  const columnCount = Math.max(visibleColumns.length, 1);
  const exportRows = collectExportRows(table);
  const filteredLeafCount = getFilteredLeafRowCount(table);
  const filterSummaryLines = buildFilterSummaryLines(table, quantityMode, showLocation);
  const filteredRows = table.getFilteredRowModel().rows;

  if (filteredLeafCount === 0) {
    throw new Error('No rows to export. Adjust filters or load report data.');
  }

  const headers = visibleColumns.map((column) => getColumnExportLabel(column));

  const bodyRows: ExcelPreviewRow[] = exportRows.map((row) => {
    const isGroupRow = row.getIsGrouped();
    const values = visibleColumns.map((column) => {
      const exportCell = getExportCellForRow(row, column, quantityMode, undefined, showLocation);
      return exportCellValueToPrimitive(exportCell);
    });
    const boldByColumn = visibleColumns.map((column, index) => {
      if (isGroupRow) {
        return index === 0 || column.id.startsWith('size-') || column.id === 'totalBags';
      }

      return column.id === 'variety' || column.id === 'name' || column.id === 'totalBags';
    });

    return {
      values,
      boldByColumn,
      isGroupedOrAggregatedRow: isGroupRow,
    };
  });

  const totalsValues = visibleColumns.map((column, columnIndex) => {
    if (columnIndex === 0) return 'Total';
    if (!isSummableExportColumn(column.id)) return '';
    return exportCellValueToPrimitive(getFooterExportValue(column.id, filteredRows, quantityMode));
  });

  const sectionRow = createSectionTitleRow('Incoming Details', columnCount);
  const totalsRow = createTotalsBodyRow(totalsValues);

  return {
    title: coldStorageName,
    subtitle: reportTitle,
    exportedRowCount: filteredLeafCount,
    headers,
    rows: [sectionRow, ...bodyRows, totalsRow],
    metaLines: [`Period: ${formatDateRangeLabel(dateFrom, dateTo)}`],
    filterSummaryLines,
    fileName: sanitizeFilename(`incoming-report_${format(generatedAt, 'yyyy-MM-dd')}.xlsx`),
  };
}

export async function buildIncomingReportExcelPackage(
  input: BuildIncomingReportExcelInput,
): Promise<IncomingReportExcelPackage> {
  const preview = buildIncomingReportPreviewData(input);
  const generatedAt = input.generatedAt ?? new Date();
  const ExcelJS = await loadExcelJS();

  const columnIds = input.table.getVisibleLeafColumns().map((column) => column.id);
  const columnCount = preview.headers.length;
  const lastColumnLetter = columnIndexToLetter(columnCount);
  const columnWidths = getColumnWidths(columnIds);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = preview.title;
  workbook.company = COLDOP_BRANDING.name;
  workbook.created = generatedAt;

  const worksheet = workbook.addWorksheet('Incoming Report', {
    views: [{ showGridLines: false }],
  });

  worksheet.mergeCells(`A1:${lastColumnLetter}1`);
  const titleRow = worksheet.getRow(1);
  titleRow.height = 28;
  titleRow.getCell(1).value = preview.title;
  titleRow.getCell(1).font = titleFont(16) as ExcelJS.Font;
  titleRow.getCell(1).alignment = ALIGN_HEADER_LEFT;

  worksheet.mergeCells(`A2:${lastColumnLetter}2`);
  const reportRow = worksheet.getRow(2);
  reportRow.height = 22;
  reportRow.getCell(1).value = preview.subtitle;
  reportRow.getCell(1).font = titleFont(13) as ExcelJS.Font;
  reportRow.getCell(1).alignment = ALIGN_HEADER_LEFT;

  const metadataText = [
    `Generated: ${format(generatedAt, 'do MMM yyyy, h:mm a')}`,
    `${preview.exportedRowCount.toLocaleString('en-IN')} ${
      preview.exportedRowCount === 1 ? 'entry' : 'entries'
    }`,
    ...preview.metaLines,
  ].join('  |  ');

  worksheet.mergeCells(`A3:${lastColumnLetter}3`);
  const metadataRow = worksheet.getRow(3);
  metadataRow.height = 18;
  metadataRow.getCell(1).value = metadataText;
  metadataRow.getCell(1).font = metadataFont() as ExcelJS.Font;
  metadataRow.getCell(1).alignment = ALIGN_HEADER_LEFT;

  worksheet.mergeCells(`A4:${lastColumnLetter}4`);
  const filterRow = worksheet.getRow(4);
  filterRow.height = preview.filterSummaryLines.length > 0 ? 36 : 14;
  filterRow.getCell(1).value =
    preview.filterSummaryLines.length > 0
      ? preview.filterSummaryLines.join('\n')
      : 'Filters: none applied';
  filterRow.getCell(1).font = metadataFont() as ExcelJS.Font;
  filterRow.getCell(1).alignment = ALIGN_FILTER_LEFT;

  worksheet.mergeCells(`A5:${lastColumnLetter}5`);
  const brandingRow = worksheet.getRow(5);
  brandingRow.height = 16;
  applyBrandingToCell(brandingRow.getCell(1));

  worksheet.getRow(6).height = 8;

  const sectionRow = preview.rows[0];
  const bodyAndTotals = preview.rows.slice(1);

  if (sectionRow?.isSectionTitle) {
    addBodyRow(worksheet, sectionRow, columnCount, columnWidths);
  }

  addColumnHeaderRow(worksheet, preview.headers);
  addStyledBodyRows(worksheet, bodyAndTotals, columnCount, columnWidths);

  worksheet.columns = preview.headers.map((header, index) => ({
    key: header,
    width: columnWidths[index],
  }));

  worksheet.views = [
    {
      showGridLines: false,
    },
  ];

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

  const buffer = (await workbook.xlsx.writeBuffer()) as ArrayBuffer;

  return {
    buffer,
    fileName: preview.fileName,
    preview,
  };
}

export async function exportIncomingReportToExcel(
  input: BuildIncomingReportExcelInput,
): Promise<void> {
  const { buffer, fileName } = await buildIncomingReportExcelPackage(input);

  downloadBlob(
    new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    fileName,
  );
}
