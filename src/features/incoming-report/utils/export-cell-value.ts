import { format, isValid, parse, parseISO } from 'date-fns';
import type { Cell, Column, Row, Table } from '@tanstack/react-table';

import type { IncomingBagSize } from '@/features/daybook/types';
import {
  formatCompactLocation,
  formatQuantity,
  locationKey,
} from '@/features/daybook/utils/format';
import type { IncomingGatePassReportRecord } from '@/features/incoming-report/api/types';
import {
  getIncomingReportTotalBags,
  type IncomingQuantityMode,
} from '@/features/incoming-report/components/columns';
import type {
  AdvancedFilterCondition,
  AdvancedReportGlobalFilter,
} from '@/features/incoming-report/utils/report-filter-fns';

const INTEGER_COLUMNS = new Set<string>(['accountNumber', 'gatePassNo', 'totalBags']);

const SUMMABLE_INTEGER_COLUMNS = new Set(['totalBags']);

const OPERATOR_LABELS: Record<string, string> = {
  contains: 'contains',
  notContains: 'does not contain',
  equals: 'equals',
  notEquals: 'does not equal',
  startsWith: 'starts with',
  endsWith: 'ends with',
  greaterThan: '>',
  greaterThanOrEqual: '>=',
  lessThan: '<',
  lessThanOrEqual: '<=',
  isEmpty: 'is blank',
  isNotEmpty: 'is not blank',
};

const indianIntegerFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
});

export type ExportCellValue =
  | { kind: 'text'; value: string }
  | { kind: 'number'; value: number; format: 'integer' }
  | { kind: 'empty' };

function parseReportNumber(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (value == null || value === '') return null;

  const parsed = Number(String(value).replaceAll(',', '').trim());

  return Number.isFinite(parsed) ? parsed : null;
}

function getBagQuantity(bag: IncomingBagSize, quantityMode: IncomingQuantityMode) {
  return quantityMode === 'current' ? bag.currentQuantity : bag.initialQuantity;
}

function hasLocation(
  location: IncomingBagSize['location'] | IncomingBagSize['paltaiLocation'],
): boolean {
  if (!location) return false;
  return Boolean(location.chamber || location.floor || location.row);
}

type SizeLocationLine = {
  quantity: number;
  locationLabel: string | null;
  paltaiLabel: string | null;
};

function buildMergedSizeLocationLines(
  bags: IncomingBagSize[],
  quantityMode: IncomingQuantityMode,
): SizeLocationLine[] {
  const merged = new Map<string, SizeLocationLine>();

  for (const bag of bags) {
    const qty = getBagQuantity(bag, quantityMode);
    const key = locationKey(bag.location);
    const locationLabel = hasLocation(bag.location) ? formatCompactLocation(bag.location) : null;
    const paltaiLabel =
      bag.paltaiLocation && hasLocation(bag.paltaiLocation)
        ? formatCompactLocation(bag.paltaiLocation)
        : null;

    const existing = merged.get(key);

    if (existing) {
      existing.quantity += qty;
      if (paltaiLabel && !existing.paltaiLabel) {
        existing.paltaiLabel = paltaiLabel;
      }
      continue;
    }

    merged.set(key, {
      quantity: qty,
      locationLabel,
      paltaiLabel,
    });
  }

  return Array.from(merged.values());
}

function formatSizeLocationSub(line: SizeLocationLine): string | undefined {
  const parts: string[] = [];

  if (line.locationLabel) {
    parts.push(`(${line.locationLabel})`);
  }

  if (line.paltaiLabel) {
    parts.push(`Paltai: (${line.paltaiLabel})`);
  }

  return parts.length > 0 ? parts.join('\n') : undefined;
}

function formatMultiLocationSegment(line: SizeLocationLine): string {
  const quantity = formatQuantity(line.quantity);

  if (!line.locationLabel) {
    return quantity;
  }

  if (line.paltaiLabel) {
    return `${quantity} (${line.locationLabel}, Paltai: ${line.paltaiLabel})`;
  }

  return `${quantity} (${line.locationLabel})`;
}

const bagsBySizeIndex = new WeakMap<IncomingGatePassReportRecord, Map<string, IncomingBagSize[]>>();

function getBagsForSizeName(
  row: IncomingGatePassReportRecord,
  sizeName: string,
): IncomingBagSize[] {
  let index = bagsBySizeIndex.get(row);

  if (!index) {
    index = new Map<string, IncomingBagSize[]>();

    for (const bag of row.bagSizes) {
      const bags = index.get(bag.name);

      if (bags) {
        bags.push(bag);
      } else {
        index.set(bag.name, [bag]);
      }
    }

    bagsBySizeIndex.set(row, index);
  }

  return index.get(sizeName) ?? [];
}

function sumBagSizeQuantity(
  rows: readonly Row<IncomingGatePassReportRecord>[],
  size: string,
  quantityMode: IncomingQuantityMode,
) {
  return rows.reduce((total, row) => {
    return (
      total +
      row.original.bagSizes
        .filter((bag) => bag.name === size)
        .reduce((sum, bag) => sum + getBagQuantity(bag, quantityMode), 0)
    );
  }, 0);
}

export function getColumnExportLabel(
  column: Column<IncomingGatePassReportRecord, unknown>,
): string {
  return column.columnDef.meta?.filterLabel ?? column.id;
}

function formatReportDate(value: unknown): string | null {
  if (value == null || value === '') return null;

  const raw = String(value).trim();
  if (raw.length === 0) return null;

  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(raw)
    ? parse(raw, 'yyyy-MM-dd', new Date())
    : parseISO(raw);

  if (!isValid(parsed)) return raw;

  return format(parsed, 'do MMMM yyyy');
}

function formatDisplayValue(
  value: unknown,
  column: Column<IncomingGatePassReportRecord, unknown>,
): string {
  const meta = column.columnDef.meta;
  if (meta?.filterValueFormatter) return meta.filterValueFormatter(value);
  if (value == null || value === '') return 'Blank';
  return String(value);
}

function formatSizeColumnValue(
  row: IncomingGatePassReportRecord,
  columnId: string,
  quantityMode: IncomingQuantityMode,
  showLocation = true,
): ExportCellValue {
  const size = columnId.slice('size-'.length);
  const bags = getBagsForSizeName(row, size);

  if (!bags.length) return { kind: 'empty' };

  if (!showLocation) {
    const total = bags.reduce((sum, bag) => sum + getBagQuantity(bag, quantityMode), 0);

    return {
      kind: 'number',
      value: total,
      format: 'integer',
    };
  }

  const lines = buildMergedSizeLocationLines(bags, quantityMode);
  const total = lines.reduce((sum, line) => sum + line.quantity, 0);
  const hasAnyLocation = lines.some(
    (line) => line.locationLabel != null || line.paltaiLabel != null,
  );

  if (!hasAnyLocation) {
    return {
      kind: 'number',
      value: total,
      format: 'integer',
    };
  }

  if (lines.length === 1) {
    const line = lines[0]!;
    const sub = formatSizeLocationSub(line);

    if (!sub) {
      return {
        kind: 'number',
        value: line.quantity,
        format: 'integer',
      };
    }

    return {
      kind: 'text',
      value: `${formatQuantity(line.quantity)}\n${sub}`,
    };
  }

  const sub = `(${lines.map((line) => formatMultiLocationSegment(line)).join(', ')})`;

  return {
    kind: 'text',
    value: `${formatQuantity(total)}\n${sub}`,
  };
}

export function formatExportCellValue(
  columnId: string,
  rawValue: unknown,
  row?: IncomingGatePassReportRecord,
  quantityMode: IncomingQuantityMode = 'current',
  showLocation = true,
): ExportCellValue {
  if (columnId.startsWith('size-')) {
    return row
      ? formatSizeColumnValue(row, columnId, quantityMode, showLocation)
      : { kind: 'empty' };
  }

  if (rawValue == null || rawValue === '') {
    return { kind: 'empty' };
  }

  if (columnId === 'date') {
    const formatted = formatReportDate(rawValue);
    return formatted ? { kind: 'text', value: formatted } : { kind: 'empty' };
  }

  if (INTEGER_COLUMNS.has(columnId)) {
    const parsed = parseReportNumber(rawValue);
    return parsed == null
      ? { kind: 'empty' }
      : { kind: 'number', value: parsed, format: 'integer' };
  }

  return { kind: 'text', value: String(rawValue) };
}

export function getExportCellForRow(
  row: Row<IncomingGatePassReportRecord>,
  column: Column<IncomingGatePassReportRecord, unknown>,
  quantityMode: IncomingQuantityMode,
  cell?: Cell<IncomingGatePassReportRecord, unknown>,
  showLocation = true,
): ExportCellValue {
  const resolvedCell = cell ?? row.getVisibleCells().find((item) => item.column.id === column.id);

  if (!resolvedCell) return { kind: 'empty' };

  const columnId = column.id;
  const meta = column.columnDef.meta;

  if (resolvedCell.getIsGrouped()) {
    const display = formatDisplayValue(resolvedCell.getValue(), column);
    const count = row.subRows.length.toLocaleString('en-IN');
    const indent = '  '.repeat(row.depth);
    return {
      kind: 'text',
      value: `${indent}${display} (${count})`,
    };
  }

  if (resolvedCell.getIsAggregated()) {
    if (meta?.numeric !== true) return { kind: 'empty' };
    const parsed = parseReportNumber(resolvedCell.getValue());
    return parsed == null
      ? { kind: 'empty' }
      : { kind: 'number', value: parsed, format: 'integer' };
  }

  if (resolvedCell.getIsPlaceholder()) {
    return { kind: 'empty' };
  }

  if (row.getIsGrouped()) {
    return { kind: 'empty' };
  }

  return formatExportCellValue(
    columnId,
    resolvedCell.getValue(),
    row.original,
    quantityMode,
    showLocation,
  );
}

export function collectExportRows(
  table: Table<IncomingGatePassReportRecord>,
): Row<IncomingGatePassReportRecord>[] {
  const grouping = table.getState().grouping;

  if (grouping.length === 0) {
    return table.getSortedRowModel().rows;
  }

  function flattenGroupedRows(
    rows: Row<IncomingGatePassReportRecord>[],
  ): Row<IncomingGatePassReportRecord>[] {
    const result: Row<IncomingGatePassReportRecord>[] = [];

    for (const row of rows) {
      result.push(row);
      if (row.subRows.length > 0) {
        result.push(...flattenGroupedRows(row.subRows));
      }
    }

    return result;
  }

  // Sorting runs after grouping in TanStack Table — use the sorted model.
  return flattenGroupedRows(table.getSortedRowModel().rows);
}

export function getFilteredLeafRowCount(table: Table<IncomingGatePassReportRecord>): number {
  return table.getFilteredRowModel().flatRows.length;
}

function formatConditionLabel(
  table: Table<IncomingGatePassReportRecord>,
  condition: AdvancedFilterCondition,
): string {
  const column = table.getColumn(String(condition.columnId));
  const columnLabel = column ? getColumnExportLabel(column) : String(condition.columnId);
  const operatorLabel = OPERATOR_LABELS[condition.operator] ?? condition.operator;

  if (condition.operator === 'isEmpty' || condition.operator === 'isNotEmpty') {
    return `${columnLabel} ${operatorLabel}`;
  }

  const value = condition.value.trim();
  if (value.length === 0) return '';

  return `${columnLabel} ${operatorLabel} "${value}"`;
}

function formatColumnFilterSummary(table: Table<IncomingGatePassReportRecord>): string[] {
  const summaries: string[] = [];

  for (const filter of table.getState().columnFilters) {
    if (!Array.isArray(filter.value) || filter.value.length === 0) continue;

    const column = table.getColumn(filter.id);
    if (!column) continue;

    const columnLabel = getColumnExportLabel(column);
    const formattedValues = filter.value.map((value) => {
      const meta = column.columnDef.meta;
      if (meta?.filterValueFormatter) {
        return meta.filterValueFormatter(value);
      }
      if (value == null || value === '') return 'Blank';
      return String(value);
    });

    summaries.push(`${columnLabel}: ${formattedValues.join(', ')}`);
  }

  return summaries;
}

function formatAdvancedFilterSummary(
  table: Table<IncomingGatePassReportRecord>,
  globalFilter: AdvancedReportGlobalFilter,
): string[] {
  const activeConditions = globalFilter.conditions
    .map((condition) => formatConditionLabel(table, condition))
    .filter((label) => label.length > 0);

  if (activeConditions.length === 0) return [];

  return [
    `Advanced (${globalFilter.logic}): ${activeConditions.join(
      globalFilter.logic === 'AND' ? ' · ' : ' | ',
    )}`,
  ];
}

function formatGroupingSummary(table: Table<IncomingGatePassReportRecord>): string | null {
  const grouping = table.getState().grouping;
  if (grouping.length === 0) return null;

  const labels = grouping
    .map((columnId) => {
      const column = table.getColumn(columnId);
      return column ? getColumnExportLabel(column) : columnId;
    })
    .join(' → ');

  return `Grouped by: ${labels}`;
}

function formatSortingSummary(table: Table<IncomingGatePassReportRecord>): string | null {
  const sorting = table.getState().sorting;
  if (sorting.length === 0) return null;

  const labels = sorting
    .map((sort) => {
      const column = table.getColumn(sort.id);
      const columnLabel = column ? getColumnExportLabel(column) : sort.id;
      return `${columnLabel} (${sort.desc ? 'desc' : 'asc'})`;
    })
    .join(', ');

  return `Sorted by: ${labels}`;
}

export function buildFilterSummaryLines(
  table: Table<IncomingGatePassReportRecord>,
  quantityMode: IncomingQuantityMode,
  showLocation = true,
): string[] {
  const globalFilter = table.getState().globalFilter;

  const lines = [
    `Quantity view: ${quantityMode === 'current' ? 'Current Qty' : 'Initial Qty'}`,
    `Show location: ${showLocation ? 'Yes' : 'No'}`,
    ...formatColumnFilterSummary(table),
    ...(typeof globalFilter === 'object' && globalFilter != null && 'conditions' in globalFilter
      ? formatAdvancedFilterSummary(table, globalFilter as AdvancedReportGlobalFilter)
      : []),
  ];

  const groupingSummary = formatGroupingSummary(table);
  if (groupingSummary) lines.push(groupingSummary);

  const sortingSummary = formatSortingSummary(table);
  if (sortingSummary) lines.push(sortingSummary);

  return lines;
}

export function exportCellValueToPrimitive(cell: ExportCellValue): string | number {
  if (cell.kind === 'empty') return '';
  if (cell.kind === 'number') return cell.value;
  return cell.value;
}

export function exportCellValueToDisplay(cell: ExportCellValue): string {
  if (cell.kind === 'empty') return '—';
  if (cell.kind === 'number') {
    return indianIntegerFormatter.format(cell.value);
  }
  return cell.value;
}

export function isSummableExportColumn(columnId: string): boolean {
  return SUMMABLE_INTEGER_COLUMNS.has(columnId) || columnId.startsWith('size-');
}

export function computeIncomingReportFooterTotals(
  rows: readonly Row<IncomingGatePassReportRecord>[],
  quantityMode: IncomingQuantityMode,
): Map<string, ExportCellValue> {
  let totalBags = 0;
  const sizeTotals = new Map<string, number>();

  for (const row of rows) {
    totalBags += getIncomingReportTotalBags(row.original, quantityMode);

    for (const bag of row.original.bagSizes) {
      const columnId = `size-${bag.name}`;
      sizeTotals.set(columnId, (sizeTotals.get(columnId) ?? 0) + getBagQuantity(bag, quantityMode));
    }
  }

  const totals = new Map<string, ExportCellValue>();
  totals.set('totalBags', {
    kind: 'number',
    value: totalBags,
    format: 'integer',
  });

  for (const [columnId, value] of sizeTotals) {
    totals.set(columnId, { kind: 'number', value, format: 'integer' });
  }

  return totals;
}

export function getFooterExportValue(
  columnId: string,
  rows: readonly Row<IncomingGatePassReportRecord>[],
  quantityMode: IncomingQuantityMode,
): ExportCellValue {
  if (columnId === 'totalBags') {
    const total = rows.reduce(
      (sum, row) => sum + getIncomingReportTotalBags(row.original, quantityMode),
      0,
    );

    return { kind: 'number', value: total, format: 'integer' };
  }

  if (columnId.startsWith('size-')) {
    const total = sumBagSizeQuantity(rows, columnId.replace(/^size-/, ''), quantityMode);

    return { kind: 'number', value: total, format: 'integer' };
  }

  return { kind: 'empty' };
}

export function getExcelNumFmt(): string {
  return '#,##,##0';
}

export function formatDateRangeLabel(dateFrom?: string, dateTo?: string): string {
  const fromDate = dateFrom ? parse(dateFrom, 'yyyy-MM-dd', new Date()) : undefined;
  const toDate = dateTo ? parse(dateTo, 'yyyy-MM-dd', new Date()) : undefined;

  if (fromDate && isValid(fromDate) && toDate && isValid(toDate)) {
    return `${format(fromDate, 'do MMM yyyy')} – ${format(toDate, 'do MMM yyyy')}`;
  }
  if (fromDate && isValid(fromDate)) {
    return `From ${format(fromDate, 'do MMM yyyy')}`;
  }
  if (toDate && isValid(toDate)) {
    return `Until ${format(toDate, 'do MMM yyyy')}`;
  }
  return 'All dates';
}
