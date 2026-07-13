import { describe, expect, it } from 'vitest';

import type { IncomingGatePassReportRecord } from '@/features/incoming-report/api/types';

import { mapIncomingSizeCellForPdf } from './map-incoming-pdf-size-cell';

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

describe('mapIncomingSizeCellForPdf', () => {
  it('returns empty cell when size has no bags', () => {
    const row = createRow();

    expect(mapIncomingSizeCellForPdf(row, 'size-Jumbo', 'current', true)).toEqual({
      text: '—',
      align: 'right',
      isEmpty: true,
    });
  });

  it('returns plain quantity when showLocation is false', () => {
    const row = createRow({
      bagSizes: [
        {
          name: 'Jumbo',
          initialQuantity: 500,
          currentQuantity: 400,
          location: { chamber: 'C1', floor: 'F1', row: 'R1' },
        },
      ],
    });

    expect(mapIncomingSizeCellForPdf(row, 'size-Jumbo', 'current', false)).toEqual({
      text: '400',
      align: 'right',
    });
  });

  it('returns stacked cell for a single bag with location', () => {
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

    expect(mapIncomingSizeCellForPdf(row, 'size-Jumbo', 'current', true)).toEqual({
      text: '500',
      align: 'right',
      stack: { main: '500', sub: '(C1/F2/R3)' },
    });
  });

  it('includes paltai location in sub text', () => {
    const row = createRow({
      bagSizes: [
        {
          name: 'Jumbo',
          initialQuantity: 500,
          currentQuantity: 500,
          location: { chamber: 'C1', floor: 'F2', row: 'R3' },
          paltaiLocation: { chamber: 'P1', floor: 'P2', row: 'P3' },
        },
      ],
    });

    expect(mapIncomingSizeCellForPdf(row, 'size-Jumbo', 'current', true)).toEqual({
      text: '500',
      align: 'right',
      stack: {
        main: '500',
        sub: '(C1/F2/R3)\nPaltai: (P1/P2/P3)',
      },
    });
  });

  it('merges quantities at the same location', () => {
    const row = createRow({
      bagSizes: [
        {
          name: 'Jumbo',
          initialQuantity: 300,
          currentQuantity: 300,
          location: { chamber: 'C1', floor: 'F1', row: 'R1' },
        },
        {
          name: 'Jumbo',
          initialQuantity: 200,
          currentQuantity: 200,
          location: { chamber: 'C1', floor: 'F1', row: 'R1' },
        },
      ],
    });

    expect(mapIncomingSizeCellForPdf(row, 'size-Jumbo', 'current', true)).toEqual({
      text: '500',
      align: 'right',
      stack: { main: '500', sub: '(C1/F1/R1)' },
    });
  });

  it('returns combined stacked cell for multiple locations', () => {
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

    expect(mapIncomingSizeCellForPdf(row, 'size-Jumbo', 'current', true)).toEqual({
      text: '600',
      align: 'right',
      stack: {
        main: '600',
        sub: '(400 (C1/F1/R1), 200 (C2/F2/R2))',
      },
    });
  });

  it('returns plain quantity when location fields are blank', () => {
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

    expect(mapIncomingSizeCellForPdf(row, 'size-Jumbo', 'current', true)).toEqual({
      text: '500',
      align: 'right',
    });
  });
});
