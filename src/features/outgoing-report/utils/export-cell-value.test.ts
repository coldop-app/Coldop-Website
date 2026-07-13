import { describe, expect, it } from 'vitest';

import type { Column, Row } from '@tanstack/react-table';

import type { OutgoingGatePassReportRecord } from '@/features/outgoing-report/api/types';

import {
  computeOutgoingReportFooterTotals,
  exportCellValueToDisplay,
  formatExportCellValue,
  getExportCellForRow,
} from './export-cell-value';

const farmerLink = {
  _id: 'link-1',
  name: 'Farmer',
  accountNumber: 42,
  address: 'Addr',
  mobileNumber: '9999999999',
};

function createRow(
  overrides: Partial<OutgoingGatePassReportRecord> = {},
): OutgoingGatePassReportRecord {
  return {
    _id: 'row-1',
    gatePassNo: 55,
    date: '2026-06-29T02:44:10.373Z',
    variety: 'Atlantic',
    orderDetails: [],
    totalBags: 0,
    farmerStorageLinkId: farmerLink,
    ...overrides,
  };
}

describe('formatExportCellValue size columns', () => {
  it('shows location below quantity for a single order line with location', () => {
    const row = createRow({
      orderDetails: [
        {
          size: 'Ration',
          quantityAvailable: 500,
          quantityIssued: 500,
          location: { chamber: 'C1', floor: 'F2', row: 'R3' },
        },
      ],
    });

    const cell = formatExportCellValue('size-Ration', 500, row, 'issued');

    expect(cell).toEqual({
      kind: 'text',
      value: '500\n(C1/F2/R3)',
    });
    expect(exportCellValueToDisplay(cell)).toBe('500\n(C1/F2/R3)');
  });

  it('keeps plain numbers when no location is present', () => {
    const row = createRow({
      orderDetails: [
        {
          size: 'Ration',
          quantityAvailable: 500,
          quantityIssued: 500,
        },
      ],
    });

    const cell = formatExportCellValue('size-Ration', 500, row, 'issued');

    expect(cell).toEqual({
      kind: 'number',
      value: 500,
      format: 'integer',
    });
  });

  it('stacks multiple locations as total with parenthetical breakdown', () => {
    const row = createRow({
      orderDetails: [
        {
          size: 'Ration',
          quantityAvailable: 400,
          quantityIssued: 400,
          location: { chamber: 'C1', floor: 'F1', row: 'R1' },
        },
        {
          size: 'Ration',
          quantityAvailable: 200,
          quantityIssued: 200,
          location: { chamber: 'C2', floor: 'F2', row: 'R2' },
        },
      ],
    });

    const cell = formatExportCellValue('size-Ration', 600, row, 'issued');

    expect(cell).toEqual({
      kind: 'text',
      value: '600\n(400 (C1/F1/R1), 200 (C2/F2/R2))',
    });
  });

  it('hides location when showLocation is false for a single line', () => {
    const row = createRow({
      orderDetails: [
        {
          size: 'Ration',
          quantityAvailable: 500,
          quantityIssued: 500,
          location: { chamber: 'C1', floor: 'F2', row: 'R3' },
        },
      ],
    });

    const cell = formatExportCellValue('size-Ration', 500, row, 'issued', false);

    expect(cell).toEqual({
      kind: 'number',
      value: 500,
      format: 'integer',
    });
  });

  it('sums quantities when showLocation is false for multiple locations', () => {
    const row = createRow({
      orderDetails: [
        {
          size: 'Ration',
          quantityAvailable: 400,
          quantityIssued: 400,
          location: { chamber: 'C1', floor: 'F1', row: 'R1' },
        },
        {
          size: 'Ration',
          quantityAvailable: 200,
          quantityIssued: 200,
          location: { chamber: 'C2', floor: 'F2', row: 'R2' },
        },
      ],
    });

    const cell = formatExportCellValue('size-Ration', 600, row, 'issued', false);

    expect(cell).toEqual({
      kind: 'number',
      value: 600,
      format: 'integer',
    });
  });

  it('stacks multi-variety size details as total with loc+variety breakdown', () => {
    const row = createRow({
      variety: 'Atlantic',
      orderDetails: [
        {
          size: 'Ration',
          quantityAvailable: 80,
          quantityIssued: 20,
          location: { chamber: '1', floor: '1', row: 'A' },
        },
        {
          size: 'Ration',
          quantityAvailable: 50,
          quantityIssued: 15,
          location: { chamber: '2', floor: '1', row: 'B' },
        },
      ],
      incomingGatePassSnapshots: [
        {
          _id: 'incoming-1',
          gatePassNo: 101,
          variety: 'Atlantic',
          bagSizes: [
            {
              name: 'Ration',
              initialQuantity: 100,
              currentQuantity: 80,
              type: 'RECEIPT',
              quantityIssued: 0,
              location: { chamber: '1', floor: '1', row: 'A' },
            },
          ],
        },
        {
          _id: 'incoming-2',
          gatePassNo: 102,
          variety: 'Chipsona',
          bagSizes: [
            {
              name: 'Ration',
              initialQuantity: 50,
              currentQuantity: 50,
              type: 'RECEIPT',
              quantityIssued: 0,
              location: { chamber: '2', floor: '1', row: 'B' },
            },
          ],
        },
      ],
    });

    const cell = formatExportCellValue('size-Ration', 35, row, 'issued');

    expect(cell).toEqual({
      kind: 'text',
      value: '35\n(20 (1/1/A, Atlantic), 15 (2/1/B, Chipsona))',
    });
  });

  it('stacks a single multi-variety detail as qty with loc+variety sub', () => {
    const row = createRow({
      variety: 'Atlantic',
      orderDetails: [
        {
          size: 'Ration',
          quantityAvailable: 80,
          quantityIssued: 20,
          location: { chamber: '1', floor: '1', row: 'A' },
        },
        {
          size: 'Goli',
          quantityAvailable: 10,
          quantityIssued: 10,
          location: { chamber: '2', floor: '1', row: 'C' },
        },
      ],
      incomingGatePassSnapshots: [
        {
          _id: 'incoming-1',
          gatePassNo: 101,
          variety: 'Atlantic',
          bagSizes: [
            {
              name: 'Ration',
              initialQuantity: 100,
              currentQuantity: 80,
              type: 'RECEIPT',
              quantityIssued: 0,
              location: { chamber: '1', floor: '1', row: 'A' },
            },
          ],
        },
        {
          _id: 'incoming-2',
          gatePassNo: 102,
          variety: 'Chipsona',
          bagSizes: [
            {
              name: 'Goli',
              initialQuantity: 10,
              currentQuantity: 10,
              type: 'RECEIPT',
              quantityIssued: 0,
              location: { chamber: '2', floor: '1', row: 'C' },
            },
          ],
        },
      ],
    });

    const cell = formatExportCellValue('size-Ration', 20, row, 'issued');

    expect(cell).toEqual({
      kind: 'text',
      value: '20\n(1/1/A, Atlantic)',
    });
  });
});

describe('computeOutgoingReportFooterTotals', () => {
  it('aggregates totals in a single pass', () => {
    const rows = [
      {
        original: createRow({
          totalBags: 600,
          orderDetails: [
            {
              size: 'Ration',
              quantityAvailable: 400,
              quantityIssued: 400,
              location: { chamber: 'C1', floor: 'F1', row: 'R1' },
            },
            {
              size: 'Goli',
              quantityAvailable: 200,
              quantityIssued: 200,
              location: { chamber: 'C2', floor: 'F2', row: 'R2' },
            },
          ],
        }),
      },
      {
        original: createRow({
          totalBags: 100,
          orderDetails: [
            {
              size: 'Ration',
              quantityAvailable: 100,
              quantityIssued: 100,
              location: { chamber: 'C3', floor: 'F3', row: 'R3' },
            },
          ],
        }),
      },
    ] as Row<OutgoingGatePassReportRecord>[];

    const totals = computeOutgoingReportFooterTotals(rows, 'issued');

    expect(totals.get('totalBags')).toEqual({
      kind: 'number',
      value: 700,
      format: 'integer',
    });
    expect(totals.get('size-Ration')).toEqual({
      kind: 'number',
      value: 500,
      format: 'integer',
    });
    expect(totals.get('size-Goli')).toEqual({
      kind: 'number',
      value: 200,
      format: 'integer',
    });
  });
});

describe('getExportCellForRow aggregated size cells', () => {
  it('exports aggregated size as a plain number without location', () => {
    const original = createRow({
      orderDetails: [
        {
          size: 'Ration',
          quantityAvailable: 100,
          quantityIssued: 100,
          location: { chamber: 'C1', floor: 'F1', row: 'R1' },
        },
      ],
    });

    const column = {
      id: 'size-Ration',
      columnDef: { meta: { numeric: true } },
    } as Column<OutgoingGatePassReportRecord, unknown>;

    const cell = {
      column,
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
      getVisibleCells: () => [cell],
    } as unknown as Row<OutgoingGatePassReportRecord>;

    const result = getExportCellForRow(row, column, 'issued', true);

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
    } as Column<OutgoingGatePassReportRecord, unknown>;

    const cell = {
      column,
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
      getVisibleCells: () => [cell],
    } as unknown as Row<OutgoingGatePassReportRecord>;

    expect(getExportCellForRow(row, column, 'issued', true)).toEqual({
      kind: 'empty',
    });
  });
});
