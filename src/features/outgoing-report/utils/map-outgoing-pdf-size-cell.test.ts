import { describe, expect, it } from 'vitest';

import type { OutgoingGatePassReportRecord } from '@/features/outgoing-report/api/types';

import { mapOutgoingSizeCellForPdf } from './map-outgoing-pdf-size-cell';

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

describe('mapOutgoingSizeCellForPdf', () => {
  it('returns empty cell when size has no order details', () => {
    expect(mapOutgoingSizeCellForPdf(createRow(), 'size-Ration', 'issued')).toEqual({
      text: '—',
      align: 'right',
      isEmpty: true,
    });
  });

  it('returns plain quantity when showLocation is false', () => {
    const row = createRow({
      orderDetails: [
        {
          size: 'Ration',
          quantityAvailable: 500,
          quantityIssued: 400,
          location: { chamber: 'C1', floor: 'F1', row: 'R1' },
        },
      ],
    });

    expect(mapOutgoingSizeCellForPdf(row, 'size-Ration', 'issued', false)).toEqual({
      text: '400',
      align: 'right',
    });
  });

  it('returns plain quantity when no location is present', () => {
    const row = createRow({
      orderDetails: [
        {
          size: 'Ration',
          quantityAvailable: 500,
          quantityIssued: 400,
        },
      ],
    });

    expect(mapOutgoingSizeCellForPdf(row, 'size-Ration', 'issued')).toEqual({
      text: '400',
      align: 'right',
    });
  });

  it('returns stacked cell for a single line with location', () => {
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

    expect(mapOutgoingSizeCellForPdf(row, 'size-Ration', 'issued')).toEqual({
      text: '500',
      align: 'right',
      stack: { main: '500', sub: '(C1/F2/R3)' },
    });
  });

  it('returns stacked multi-location breakdown', () => {
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

    expect(mapOutgoingSizeCellForPdf(row, 'size-Ration', 'issued')).toEqual({
      text: '600',
      align: 'right',
      stack: {
        main: '600',
        sub: '(400 (C1/F1/R1), 200 (C2/F2/R2))',
      },
    });
  });

  it('returns stacked multi-variety breakdown with loc and variety', () => {
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

    expect(mapOutgoingSizeCellForPdf(row, 'size-Ration', 'issued')).toEqual({
      text: '35',
      align: 'right',
      stack: {
        main: '35',
        sub: '(20 (1/1/A, Atlantic), 15 (2/1/B, Chipsona))',
      },
    });
  });
});
