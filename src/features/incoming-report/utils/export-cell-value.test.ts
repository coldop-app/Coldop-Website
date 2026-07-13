import { describe, expect, it } from 'vitest';

import type { Column, Row } from '@tanstack/react-table';

import type { IncomingGatePassReportRecord } from '@/features/incoming-report/api/types';

import {
  computeIncomingReportFooterTotals,
  exportCellValueToDisplay,
  formatExportCellValue,
  getExportCellForRow,
} from './export-cell-value';

function createRow(
  overrides: Partial<IncomingGatePassReportRecord> = {},
): IncomingGatePassReportRecord {
  return {
    _id: 'row-1',
    gatePassNo: 55,
    date: '2026-06-29T02:44:10.373Z',
    type: 'RECEIPT',
    variety: 'Atlantic',
    status: 'OPEN',
    bagSizes: [],
    initialTotal: 0,
    currentTotal: 0,
    farmerStorageLinkId: {
      _id: 'farmer-1',
      name: 'lokesh',
      accountNumber: 8,
      address: 'mandi road',
      mobileNumber: '7757041279',
    },
    ...overrides,
  };
}

describe('formatExportCellValue size columns', () => {
  it('shows location below quantity for a single bag with location', () => {
    const row = createRow({
      bagSizes: [
        {
          name: 'Jumbo',
          initialQuantity: 500,
          currentQuantity: 500,
          location: { chamber: 'C1', floor: 'F2', row: 'R3' },
        },
      ],
    });

    const cell = formatExportCellValue('size-Jumbo', 500, row, 'current');

    expect(cell).toEqual({
      kind: 'text',
      value: '500\n(C1/F2/R3)',
    });
    expect(exportCellValueToDisplay(cell)).toBe('500\n(C1/F2/R3)');
  });

  it('keeps plain numbers when no location is present', () => {
    const row = createRow({
      bagSizes: [
        {
          name: 'Jumbo',
          initialQuantity: 500,
          currentQuantity: 500,
          location: { chamber: '', floor: '', row: '' },
        },
      ],
    });

    const cell = formatExportCellValue('size-Jumbo', 500, row, 'current');

    expect(cell).toEqual({
      kind: 'number',
      value: 500,
      format: 'integer',
    });
  });

  it('stacks multiple bags as total with parenthetical location breakdown', () => {
    const row = createRow({
      bagSizes: [
        {
          name: 'Jumbo',
          initialQuantity: 500,
          currentQuantity: 400,
          location: { chamber: 'C1', floor: 'F1', row: 'R1' },
        },
        {
          name: 'Jumbo',
          initialQuantity: 200,
          currentQuantity: 200,
          location: { chamber: 'C2', floor: 'F2', row: 'R2' },
        },
      ],
    });

    const cell = formatExportCellValue('size-Jumbo', 600, row, 'current');

    expect(cell).toEqual({
      kind: 'text',
      value: '600\n(400 (C1/F1/R1), 200 (C2/F2/R2))',
    });
  });

  it('hides location when showLocation is false for a single bag', () => {
    const row = createRow({
      bagSizes: [
        {
          name: 'Jumbo',
          initialQuantity: 500,
          currentQuantity: 500,
          location: { chamber: 'C1', floor: 'F2', row: 'R3' },
        },
      ],
    });

    const cell = formatExportCellValue('size-Jumbo', 500, row, 'current', false);

    expect(cell).toEqual({
      kind: 'number',
      value: 500,
      format: 'integer',
    });
  });

  it('sums quantities when showLocation is false for multiple bags', () => {
    const row = createRow({
      bagSizes: [
        {
          name: 'Jumbo',
          initialQuantity: 500,
          currentQuantity: 400,
          location: { chamber: 'C1', floor: 'F1', row: 'R1' },
        },
        {
          name: 'Jumbo',
          initialQuantity: 200,
          currentQuantity: 200,
          location: { chamber: 'C2', floor: 'F2', row: 'R2' },
        },
      ],
    });

    const cell = formatExportCellValue('size-Jumbo', 600, row, 'current', false);

    expect(cell).toEqual({
      kind: 'number',
      value: 600,
      format: 'integer',
    });
  });
});

describe('computeIncomingReportFooterTotals', () => {
  it('aggregates totals in a single pass', () => {
    const rows = [
      {
        original: createRow({
          initialTotal: 700,
          currentTotal: 600,
          bagSizes: [
            {
              name: 'Jumbo',
              initialQuantity: 500,
              currentQuantity: 400,
              location: { chamber: 'C1', floor: 'F1', row: 'R1' },
            },
            {
              name: 'Medium',
              initialQuantity: 200,
              currentQuantity: 200,
              location: { chamber: 'C2', floor: 'F2', row: 'R2' },
            },
          ],
        }),
      },
      {
        original: createRow({
          initialTotal: 100,
          currentTotal: 100,
          bagSizes: [
            {
              name: 'Jumbo',
              initialQuantity: 100,
              currentQuantity: 100,
              location: { chamber: 'C3', floor: 'F3', row: 'R3' },
            },
          ],
        }),
      },
    ] as Row<IncomingGatePassReportRecord>[];

    const totals = computeIncomingReportFooterTotals(rows, 'current');

    expect(totals.get('totalBags')).toEqual({
      kind: 'number',
      value: 700,
      format: 'integer',
    });
    expect(totals.get('size-Jumbo')).toEqual({
      kind: 'number',
      value: 500,
      format: 'integer',
    });
    expect(totals.get('size-Medium')).toEqual({
      kind: 'number',
      value: 200,
      format: 'integer',
    });
  });
});

describe('getExportCellForRow aggregated size cells', () => {
  it('exports aggregated size as a plain number without location', () => {
    const original = createRow({
      bagSizes: [
        {
          name: 'Jumbo',
          initialQuantity: 100,
          currentQuantity: 100,
          location: { chamber: 'C1', floor: 'F1', row: 'R1' },
        },
      ],
    });

    const column = {
      id: 'size-Jumbo',
      columnDef: { meta: { numeric: true } },
    } as Column<IncomingGatePassReportRecord, unknown>;

    const cell = {
      getIsGrouped: () => false,
      getIsAggregated: () => true,
      getIsPlaceholder: () => false,
      getValue: () => 750,
    };

    const row = {
      original,
      depth: 0,
      subRows: [],
      getIsGrouped: () => true,
      getVisibleCells: () => [],
    } as unknown as Row<IncomingGatePassReportRecord>;

    const result = getExportCellForRow(row, column, 'current', cell as never, true);

    expect(result).toEqual({
      kind: 'number',
      value: 750,
      format: 'integer',
    });
    expect(exportCellValueToDisplay(result)).toBe('750');
  });

  it('returns empty for non-numeric aggregated cells', () => {
    const column = {
      id: 'variety',
      columnDef: { meta: {} },
    } as Column<IncomingGatePassReportRecord, unknown>;

    const cell = {
      getIsGrouped: () => false,
      getIsAggregated: () => true,
      getIsPlaceholder: () => false,
      getValue: () => 'Atlantic',
    };

    const row = {
      original: createRow(),
      depth: 0,
      subRows: [],
      getIsGrouped: () => true,
      getVisibleCells: () => [],
    } as unknown as Row<IncomingGatePassReportRecord>;

    expect(getExportCellForRow(row, column, 'current', cell as never, true)).toEqual({
      kind: 'empty',
    });
  });
});
