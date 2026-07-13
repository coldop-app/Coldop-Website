import { format } from 'date-fns';
import type ExcelJS from 'exceljs';

import type {
  FarmerStockLedgerPdfData,
  PdfLedgerItem,
  PdfLedgerLeafRow,
  PdfLedgerSizeValue,
} from '@/features/people-report/utils/build-farmer-stock-ledger-pdf-data';
import { formatPdfVarietyValue } from '@/features/people-report/utils/build-farmer-stock-ledger-pdf-data';
import type { LedgerExportColumn } from '@/features/people-report/utils/export-cell-value';
import type { StockSummaryMatrix } from '@/features/people/utils/build-farmer-stock-summary';
import {
  COLDOP_BRANDING,
  EXPORT_INTEGER_NUM_FMT,
  EXPORT_THEME_COLORS,
} from '@/lib/export-report-theme';
import type { ExcelPreviewRow, ExcelPreviewStockSummary } from '@/lib/excel-preview-tab';
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

export type LedgerColumnLayout = {
  headers: string[];
  leadingColumnCount: number;
  sizeColumnStartIndex: number;
  totalColumnIndex: number;
  remarksColumnIndex: number;
};

export type ExcelBodyRow = {
  values: Array<string | number>;
  boldByColumn: boolean[];
  isGroupedOrAggregatedRow: boolean;
  isSectionTitle?: boolean;
  isTotalsRow?: boolean;
};

const LEDGER_EXCEL_COLUMN_WIDTHS: Record<string, number> = {
  date: 14,
  gatePassNo: 11,
  manualParchiNumber: 14,
  variety: 12,
  stockFilter: 10,
  customMarka: 10,
  rowBags: 11,
  totalBags: 14,
  remarks: 16,
};

const DEFAULT_LEDGER_COLUMN_WIDTH = 10;
const LEDGER_SIZE_COLUMN_WIDTH = 12;
const ROW_LINE_HEIGHT = 15;
const MIN_BODY_ROW_HEIGHT = 18;

export function getFixedLedgerColumnWidths(exportColumns: LedgerExportColumn[]): number[] {
  return exportColumns.map((column) => {
    if (column.id.startsWith('size-')) return LEDGER_SIZE_COLUMN_WIDTH;
    return LEDGER_EXCEL_COLUMN_WIDTHS[column.id] ?? DEFAULT_LEDGER_COLUMN_WIDTH;
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

    const lines = estimateWrappedLineCount(
      value,
      columnWidths[index] ?? DEFAULT_LEDGER_COLUMN_WIDTH,
    );
    maxLines = Math.max(maxLines, lines);
  }

  return Math.max(MIN_BODY_ROW_HEIGHT, maxLines * ROW_LINE_HEIGHT + 3);
}

export function getLedgerColumnLayoutFromExportColumns(
  exportColumns: LedgerExportColumn[],
): LedgerColumnLayout {
  const headers = exportColumns.map((column) => column.header);
  const sizeColumnStartIndex = exportColumns.findIndex((column) => column.id.startsWith('size-'));
  const totalColumnIndex = exportColumns.findIndex((column) => column.id === 'totalBags');
  const remarksColumnIndex = exportColumns.findIndex((column) => column.id === 'remarks');

  return {
    headers,
    leadingColumnCount: sizeColumnStartIndex >= 0 ? sizeColumnStartIndex : headers.length,
    sizeColumnStartIndex: sizeColumnStartIndex >= 0 ? sizeColumnStartIndex : headers.length,
    totalColumnIndex: totalColumnIndex >= 0 ? totalColumnIndex : Math.max(headers.length - 2, 0),
    remarksColumnIndex: remarksColumnIndex >= 0 ? remarksColumnIndex : headers.length - 1,
  };
}

export function getLedgerColumnLayout(
  sizeColumns: string[],
  showStockFilter: boolean,
  showCustomMarka: boolean,
): LedgerColumnLayout {
  const headers = ['Date', 'Gate Pass No', 'Manual Parchi No', 'Variety'];

  if (showStockFilter) headers.push('Filter');
  if (showCustomMarka) headers.push('Marka');

  const sizeColumnStartIndex = headers.length;
  headers.push(...sizeColumns, 'Total Bags', 'Cumulative Total', 'Remarks');

  const rowBagsColumnIndex = sizeColumnStartIndex + sizeColumns.length;
  const totalColumnIndex = rowBagsColumnIndex + 1;
  const remarksColumnIndex = totalColumnIndex + 1;

  return {
    headers,
    leadingColumnCount: sizeColumnStartIndex,
    sizeColumnStartIndex,
    totalColumnIndex,
    remarksColumnIndex,
  };
}

export function buildLegacyExportColumns(
  reportData: FarmerStockLedgerPdfData,
): LedgerExportColumn[] {
  const columns: LedgerExportColumn[] = [
    { id: 'date', header: 'Date' },
    { id: 'gatePassNo', header: 'Gate Pass No' },
    { id: 'manualParchiNumber', header: 'Manual Parchi No' },
    { id: 'variety', header: 'Variety' },
  ];

  if (reportData.showStockFilter) {
    columns.push({ id: 'stockFilter', header: 'Filter' });
  }

  if (reportData.showCustomMarka) {
    columns.push({ id: 'customMarka', header: 'Marka' });
  }

  for (const size of reportData.sizeColumns) {
    columns.push({ id: `size-${size}`, header: size });
  }

  columns.push({ id: 'rowBags', header: 'Total Bags' });
  columns.push({ id: 'totalBags', header: 'Cumulative Total' });
  columns.push({ id: 'remarks', header: 'Remarks' });

  return columns;
}

export function getExportLayout(reportData: FarmerStockLedgerPdfData): {
  exportColumns: LedgerExportColumn[];
  layout: LedgerColumnLayout;
} {
  const exportColumns =
    reportData.exportColumns.length > 0
      ? reportData.exportColumns
      : buildLegacyExportColumns(reportData);

  const layout =
    reportData.exportColumns.length > 0
      ? getLedgerColumnLayoutFromExportColumns(exportColumns)
      : getLedgerColumnLayout(
          reportData.sizeColumns,
          reportData.showStockFilter,
          reportData.showCustomMarka,
        );

  return { exportColumns, layout };
}

function getDayOrdinal(day: number): string {
  const mod10 = day % 10;
  const mod100 = day % 100;
  if (mod10 === 1 && mod100 !== 11) return `${day}st`;
  if (mod10 === 2 && mod100 !== 12) return `${day}nd`;
  if (mod10 === 3 && mod100 !== 13) return `${day}rd`;
  return `${day}th`;
}

export function getExportDateLabel(date: Date): string {
  const day = getDayOrdinal(date.getDate());
  const month = date.toLocaleString('en-IN', { month: 'long' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

function formatPdfSizeValue(value: PdfLedgerSizeValue | null | undefined): string {
  if (!value) return '—';
  if (value.type === 'stacked') return `${value.main}\n${value.sub}`;
  return value.value;
}

function parseLocaleNumber(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '' || trimmed === '—') return null;

  const normalized = trimmed.replace(/,/g, '');
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) return null;

  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? null : parsed;
}

function coerceToNumber(value: string | number): string | number {
  if (typeof value === 'number') return value;

  const trimmed = value.trim();
  if (trimmed === '' || trimmed === '—') return value;

  const parsed = parseLocaleNumber(trimmed);
  if (parsed !== null) return parsed;

  return value;
}

function createSectionTitleRow(title: string, columnCount: number): ExcelBodyRow {
  return {
    values: [title, ...Array(columnCount - 1).fill('')],
    boldByColumn: Array(columnCount).fill(true),
    isGroupedOrAggregatedRow: true,
    isSectionTitle: true,
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

function createTotalsRowValues(
  exportColumns: LedgerExportColumn[],
  footerLabel: string,
  footerSizeTotals: Record<string, number>,
  closingBalance: number,
  rowBagsTotal: number,
): Array<string | number> {
  const values: Array<string | number> = Array(exportColumns.length).fill('');

  exportColumns.forEach((column, index) => {
    if (index === 0) {
      values[index] = footerLabel;
      return;
    }

    if (column.id.startsWith('size-')) {
      const size = column.id.replace(/^size-/, '');
      const value = footerSizeTotals[size] ?? 0;
      values[index] = value !== 0 ? value : '—';
      return;
    }

    if (column.id === 'rowBags') {
      values[index] = rowBagsTotal > 0 ? rowBagsTotal : '—';
      return;
    }

    if (column.id === 'totalBags') {
      values[index] = closingBalance;
    }
  });

  return values;
}

function createTotalsBodyRow(values: Array<string | number>): ExcelBodyRow {
  return {
    values,
    boldByColumn: values.map((value, index) => index === 0 || typeof value === 'number'),
    isGroupedOrAggregatedRow: true,
    isTotalsRow: true,
  };
}

export function getGroupCellValue(
  item: Extract<PdfLedgerItem, { kind: 'group' }>,
  column: LedgerExportColumn,
  columnIndex: number,
): string | number {
  if (columnIndex === 0) {
    return `${'  '.repeat(item.depth)}${item.label} (${item.childCount})`;
  }

  if (column.id.startsWith('size-')) {
    const size = column.id.replace(/^size-/, '');
    const sizeValue = item.sizes[size] ?? 0;
    return sizeValue > 0 ? sizeValue : '—';
  }

  if (column.id === 'rowBags') {
    return item.rowBagsTotal > 0 ? item.rowBagsTotal : '—';
  }

  return '';
}

export function getLeafCellValue(
  leaf: PdfLedgerLeafRow,
  column: LedgerExportColumn,
  columnIndex: number,
): string | number {
  if (columnIndex === 0) {
    return `${'  '.repeat(leaf.depth)}${leaf.date}`;
  }

  switch (column.id) {
    case 'gatePassNo':
      return leaf.gatePass;
    case 'manualParchiNumber':
      return leaf.manualParchi;
    case 'variety':
      return leaf.suppressedGroupColumns.includes('variety')
        ? ''
        : formatPdfVarietyValue(leaf.variety);
    case 'stockFilter':
      return leaf.suppressedGroupColumns.includes('stockFilter') ? '' : leaf.stockFilter;
    case 'customMarka':
      return leaf.customMarka;
    case 'rowBags':
      return leaf.rowBags;
    case 'totalBags':
      return leaf.total;
    case 'remarks':
      return leaf.remarks;
    default:
      if (column.id.startsWith('size-')) {
        return formatPdfSizeValue(leaf.sizes[column.id.replace(/^size-/, '')]);
      }
      return '';
  }
}

export function ledgerItemsToBodyRows(
  items: PdfLedgerItem[],
  _layout: LedgerColumnLayout,
  exportColumns: LedgerExportColumn[],
): ExcelBodyRow[] {
  return items.map((item) => {
    if (item.kind === 'group') {
      const values: Array<string | number> = [];
      const boldByColumn: boolean[] = [];

      exportColumns.forEach((column, index) => {
        const value = getGroupCellValue(item, column, index);
        values.push(coerceToNumber(value));
        boldByColumn.push(index === 0 || column.id.startsWith('size-') || column.id === 'rowBags');
      });

      return {
        values,
        boldByColumn,
        isGroupedOrAggregatedRow: true,
      };
    }

    const leaf = item as PdfLedgerLeafRow;
    const values: Array<string | number> = [];
    const boldByColumn: boolean[] = [];

    exportColumns.forEach((column, index) => {
      const value = getLeafCellValue(leaf, column, index);
      values.push(coerceToNumber(value));
      boldByColumn.push(
        leaf.isOpeningBalance ||
          column.id === 'variety' ||
          column.id === 'rowBags' ||
          column.id === 'totalBags',
      );
    });

    return {
      values,
      boldByColumn,
      isGroupedOrAggregatedRow: false,
    };
  });
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
  dataRow: ExcelBodyRow,
  columnCount: number,
  columnWidths: number[],
) {
  excelRow.height = calculateBodyRowHeight(dataRow.values, columnWidths);

  const rowFill = dataRow.isSectionTitle
    ? FILLS.section
    : dataRow.isGroupedOrAggregatedRow
      ? FILLS.group
      : undefined;

  for (let columnNumber = 1; columnNumber <= columnCount; columnNumber++) {
    const cell = excelRow.getCell(columnNumber);
    if (rowFill) {
      cell.fill = rowFill;
    }
    cell.border = THIN_BORDER;

    const isBold = dataRow.isSectionTitle || dataRow.boldByColumn[columnNumber - 1] === true;
    const isGroupLabel =
      dataRow.isGroupedOrAggregatedRow &&
      !dataRow.isSectionTitle &&
      !dataRow.isTotalsRow &&
      columnNumber === 1;

    cell.font = (
      dataRow.isSectionTitle
        ? bodyFont(true, COLORS.primary)
        : isGroupLabel
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

function addStyledBodyRows(
  worksheet: ExcelJS.Worksheet,
  dataRows: ExcelBodyRow[],
  columnCount: number,
  columnWidths: number[],
  previewRows: ExcelPreviewRow[],
) {
  if (dataRows.length === 0) return;

  const excelRows = worksheet.addRows(dataRows.map((row) => row.values));

  for (let index = 0; index < dataRows.length; index++) {
    const dataRow = dataRows[index];
    styleBodyRow(excelRows[index], dataRow, columnCount, columnWidths);
    previewRows.push(dataRow);
  }
}

function addBodyRow(
  worksheet: ExcelJS.Worksheet,
  dataRow: ExcelBodyRow,
  columnCount: number,
  columnWidths: number[],
) {
  const excelRow = worksheet.addRow(dataRow.values);
  styleBodyRow(excelRow, dataRow, columnCount, columnWidths);
}

function addColumnHeaderRow(worksheet: ExcelJS.Worksheet, headers: string[]) {
  const row = worksheet.addRow(headers);
  row.height = 22;
  styleHeaderCells(row);
  return row;
}

function addTotalsRow(
  worksheet: ExcelJS.Worksheet,
  values: Array<string | number>,
  columnCount: number,
) {
  const exRow = worksheet.addRow(values);
  exRow.height = 22;

  for (let colNumber = 1; colNumber <= columnCount; colNumber++) {
    const rawVal = values[colNumber - 1];
    const cell = exRow.getCell(colNumber);
    cell.fill = FILLS.total;
    cell.border = TOTAL_BORDER;
    cell.font = bodyFont(true, COLORS.primary) as ExcelJS.Font;
    cell.alignment = ALIGN_CENTER;
    if (typeof rawVal === 'number') {
      cell.numFmt = EXPORT_INTEGER_NUM_FMT;
    }
  }
}

function addStockSummaryRows(
  worksheet: ExcelJS.Worksheet,
  matrix: StockSummaryMatrix,
  sizeColumns: string[],
  columnCount: number,
  columnWidths: number[],
): ExcelPreviewStockSummary {
  const summaryTitle = createSectionTitleRow('Stock Summary', columnCount);
  addBodyRow(worksheet, summaryTitle, columnCount, columnWidths);

  const summaryHeaders = ['Varieties', ...sizeColumns, 'Total'];
  const previewDataRows: Array<Array<string | number>> = [];

  const paddedHeaders = [
    ...summaryHeaders,
    ...Array(Math.max(0, columnCount - summaryHeaders.length)).fill(''),
  ].slice(0, columnCount);

  const headerRow = worksheet.addRow(paddedHeaders);
  headerRow.height = 22;
  styleHeaderCells(headerRow);

  for (const summaryRow of matrix.rows) {
    const values: Array<string | number> = [summaryRow.variety];

    for (const size of sizeColumns) {
      values.push(summaryRow.bySize[size] ?? 0);
    }

    values.push(summaryRow.total);
    previewDataRows.push([...values]);

    while (values.length < columnCount) {
      values.push('');
    }

    const row: ExcelBodyRow = {
      values: values.slice(0, columnCount),
      boldByColumn: Array.from(
        { length: columnCount },
        (_, index) => index === summaryHeaders.length - 1,
      ),
      isGroupedOrAggregatedRow: false,
    };
    addBodyRow(worksheet, row, columnCount, columnWidths);
  }

  const footerValues: Array<string | number> = ['Bag Total'];
  for (const size of sizeColumns) {
    footerValues.push(matrix.footerBySize[size] ?? 0);
  }
  footerValues.push(matrix.grandTotal);

  const footerPreview = [...footerValues];
  while (footerValues.length < columnCount) {
    footerValues.push('');
  }

  addTotalsRow(worksheet, footerValues.slice(0, columnCount), columnCount);
  worksheet.addRow([]);

  return {
    headers: summaryHeaders,
    rows: previewDataRows,
    footer: footerPreview,
  };
}

export type BuildFarmerStockLedgerExcelPackageInput = {
  reportData: FarmerStockLedgerPdfData;
  coldStorageName: string;
  coldStorageAddress?: string;
  filterSummaryLines: string[];
  generatedAt?: Date;
};

export type FarmerStockLedgerPreviewData = {
  title: string;
  subtitle: string;
  dateLabel: string;
  exportedRowCount: number;
  fileName: string;
  headers: string[];
  rows: ExcelPreviewRow[];
  farmerName: string;
  farmerAddress?: string;
  metaLines: string[];
  filterSummaryLines: string[];
  stockSummary?: ExcelPreviewStockSummary;
};

export type FarmerStockLedgerExcelPackage = {
  buffer: ArrayBuffer;
  fileName: string;
  preview: FarmerStockLedgerPreviewData;
};

export function hasFarmerStockLedgerExportRows(reportData: FarmerStockLedgerPdfData): boolean {
  return reportData.incomingLedger.length > 0 || reportData.outgoingLedger.length > 0;
}

function sanitizeColdStorageName(coldStorageName: string): string {
  return (
    coldStorageName
      .trim()
      .replace(/[\\/:*?"<>|]/g, '')
      .replace(/\s+/g, ' ') || 'Cold Storage'
  );
}

export function buildFarmerStockLedgerPreviewData({
  reportData,
  coldStorageName,
  coldStorageAddress,
  filterSummaryLines,
  generatedAt = new Date(),
}: BuildFarmerStockLedgerExcelPackageInput): FarmerStockLedgerPreviewData {
  if (!hasFarmerStockLedgerExportRows(reportData)) {
    throw new Error('No rows to export. Adjust filters or load report data.');
  }

  const { exportColumns, layout } = getExportLayout(reportData);
  const columnCount = layout.headers.length;

  const incomingBody = ledgerItemsToBodyRows(reportData.incomingLedger, layout, exportColumns);
  const outgoingBody = ledgerItemsToBodyRows(reportData.outgoingLedger, layout, exportColumns);

  const incomingTotals = createTotalsRowValues(
    exportColumns,
    'Total',
    reportData.incomingFooterSizes,
    reportData.incomingClosingBalance,
    reportData.stats.incomingBags,
  );
  const outgoingTotals = createTotalsRowValues(
    exportColumns,
    'Closing Balance',
    reportData.outgoingFooterSizes,
    reportData.outgoingClosingBalance,
    reportData.stats.outgoingBags,
  );

  const incomingSection = createSectionTitleRow('Incoming Details', columnCount);
  const outgoingSection = createSectionTitleRow('Outgoing Details', columnCount);
  const incomingTotalsRow = createTotalsBodyRow(incomingTotals);
  const outgoingTotalsRow = createTotalsBodyRow(outgoingTotals);

  const safeName = sanitizeColdStorageName(coldStorageName);
  const dateLabel = getExportDateLabel(generatedAt);
  const fileName = `farmer-stock-ledger_${format(generatedAt, 'yyyy-MM-dd')}.xlsx`;

  const farmerName = reportData.farmer.name;
  const farmerAddress = coldStorageAddress?.trim() || undefined;
  const metaLines = [
    typeof reportData.farmer.accountNumber === 'number'
      ? `Account: ${reportData.farmer.accountNumber.toLocaleString('en-IN')}`
      : null,
    `Mobile: ${reportData.farmer.mobileNumber}`,
  ].filter((line): line is string => Boolean(line));

  const stockSummary: ExcelPreviewStockSummary = {
    headers: ['Varieties', ...reportData.sizeColumns, 'Total'],
    rows: reportData.stockSummary.rows.map((row) => {
      const values: Array<string | number> = [row.variety];
      for (const size of reportData.sizeColumns) {
        values.push(row.bySize[size] ?? 0);
      }
      values.push(row.total);
      return values;
    }),
    footer: [
      'Bag Total',
      ...reportData.sizeColumns.map((size) => reportData.stockSummary.footerBySize[size] ?? 0),
      reportData.stockSummary.grandTotal,
    ],
  };

  const previewRows: ExcelPreviewRow[] = [
    incomingSection,
    ...incomingBody,
    incomingTotalsRow,
    outgoingSection,
    ...outgoingBody,
    outgoingTotalsRow,
  ];

  return {
    title: safeName,
    subtitle: 'Farmer Stock Ledger',
    dateLabel,
    exportedRowCount: incomingBody.length + outgoingBody.length,
    fileName,
    headers: layout.headers,
    rows: previewRows,
    farmerName,
    farmerAddress,
    metaLines,
    filterSummaryLines,
    stockSummary,
  };
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
}

function applyFarmerDetailsToCell(cell: ExcelJS.Cell, farmerName: string, farmerAddress?: string) {
  const richText: ExcelJS.RichText[] = [
    {
      font: {
        name: 'Calibri',
        size: 10,
        color: { argb: COLORS.mutedForeground },
      },
      text: 'Farmer: ',
    },
    {
      font: {
        name: 'Calibri',
        size: 11,
        bold: true,
        color: { argb: COLORS.foreground },
      },
      text: farmerName,
    },
  ];

  if (farmerAddress) {
    richText.push(
      {
        font: {
          name: 'Calibri',
          size: 10,
          color: { argb: COLORS.mutedForeground },
        },
        text: '  |  ',
      },
      {
        font: {
          name: 'Calibri',
          size: 10,
          color: { argb: COLORS.mutedForeground },
        },
        text: 'Address: ',
      },
      {
        font: {
          name: 'Calibri',
          size: 11,
          bold: true,
          color: { argb: COLORS.foreground },
        },
        text: farmerAddress,
      },
    );
  }

  cell.value = { richText };
}

export async function buildFarmerStockLedgerExcelPackage({
  reportData,
  coldStorageName,
  coldStorageAddress,
  filterSummaryLines,
  generatedAt = new Date(),
}: BuildFarmerStockLedgerExcelPackageInput): Promise<FarmerStockLedgerExcelPackage> {
  const preview = buildFarmerStockLedgerPreviewData({
    reportData,
    coldStorageName,
    coldStorageAddress,
    filterSummaryLines,
    generatedAt,
  });

  const ExcelJS = await loadExcelJS();
  const { exportColumns, layout } = getExportLayout(reportData);
  const columnCount = layout.headers.length;
  const lastColumnLetter = columnIndexToLetter(columnCount);
  const columnWidths = getFixedLedgerColumnWidths(exportColumns);

  const incomingBody = ledgerItemsToBodyRows(reportData.incomingLedger, layout, exportColumns);
  const outgoingBody = ledgerItemsToBodyRows(reportData.outgoingLedger, layout, exportColumns);

  const incomingTotals = createTotalsRowValues(
    exportColumns,
    'Total',
    reportData.incomingFooterSizes,
    reportData.incomingClosingBalance,
    reportData.stats.incomingBags,
  );
  const outgoingTotals = createTotalsRowValues(
    exportColumns,
    'Closing Balance',
    reportData.outgoingFooterSizes,
    reportData.outgoingClosingBalance,
    reportData.stats.outgoingBags,
  );

  const incomingSection = createSectionTitleRow('Incoming Details', columnCount);
  const outgoingSection = createSectionTitleRow('Outgoing Details', columnCount);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = preview.title;
  workbook.company = COLDOP_BRANDING.name;
  workbook.created = generatedAt;

  const worksheet = workbook.addWorksheet('Farmer Stock Ledger', {
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
      preview.exportedRowCount === 1 ? 'ledger row' : 'ledger rows'
    }`,
    ...preview.metaLines,
  ].join('  |  ');

  worksheet.mergeCells(`A3:${lastColumnLetter}3`);
  const farmerRow = worksheet.getRow(3);
  farmerRow.height = 20;
  applyFarmerDetailsToCell(farmerRow.getCell(1), preview.farmerName, preview.farmerAddress);
  farmerRow.getCell(1).alignment = ALIGN_HEADER_LEFT;

  worksheet.mergeCells(`A4:${lastColumnLetter}4`);
  const metadataRow = worksheet.getRow(4);
  metadataRow.height = 18;
  metadataRow.getCell(1).value = metadataText;
  metadataRow.getCell(1).font = metadataFont() as ExcelJS.Font;
  metadataRow.getCell(1).alignment = ALIGN_HEADER_LEFT;

  worksheet.mergeCells(`A5:${lastColumnLetter}5`);
  const filterRow = worksheet.getRow(5);
  filterRow.height = filterSummaryLines.length > 0 ? 36 : 14;
  filterRow.getCell(1).value =
    filterSummaryLines.length > 0 ? filterSummaryLines.join('\n') : 'Filters: none applied';
  filterRow.getCell(1).font = metadataFont() as ExcelJS.Font;
  filterRow.getCell(1).alignment = ALIGN_FILTER_LEFT;

  worksheet.mergeCells(`A6:${lastColumnLetter}6`);
  const brandingRow = worksheet.getRow(6);
  brandingRow.height = 16;
  applyBrandingToCell(brandingRow.getCell(1));
  brandingRow.getCell(1).alignment = ALIGN_HEADER_LEFT;

  worksheet.getRow(7).height = 8;

  const previewRows: ExcelPreviewRow[] = [];

  addStockSummaryRows(
    worksheet,
    reportData.stockSummary,
    reportData.sizeColumns,
    columnCount,
    columnWidths,
  );

  addBodyRow(worksheet, incomingSection, columnCount, columnWidths);
  previewRows.push(incomingSection);

  addColumnHeaderRow(worksheet, layout.headers);

  addStyledBodyRows(worksheet, incomingBody, columnCount, columnWidths, previewRows);

  addTotalsRow(worksheet, incomingTotals, columnCount);

  worksheet.addRow([]);

  addBodyRow(worksheet, outgoingSection, columnCount, columnWidths);
  previewRows.push(outgoingSection);

  addColumnHeaderRow(worksheet, layout.headers);

  addStyledBodyRows(worksheet, outgoingBody, columnCount, columnWidths, previewRows);

  addTotalsRow(worksheet, outgoingTotals, columnCount);

  worksheet.columns = layout.headers.map((header, index) => ({
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
