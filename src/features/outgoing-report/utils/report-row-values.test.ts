import { describe, expect, it } from 'vitest';

import type { OutgoingGatePassReportRecord } from '@/features/outgoing-report/api/types';

import {
  expandOutgoingReportRowsByVariety,
  formatOutgoingReportVarietyBreakdownForExport,
  getOutgoingReportRowId,
  getOutgoingReportSizeQuantityDetailLines,
  getOutgoingReportVarietyBreakdown,
  hasMultipleOutgoingReportVarieties,
} from './report-row-values';

const farmerLink = {
  _id: 'link-1',
  name: 'Farmer',
  accountNumber: 42,
  address: 'Addr',
  mobileNumber: '9999999999',
};

function createMultiVarietyPass(): OutgoingGatePassReportRecord {
  return {
    _id: 'outgoing-1',
    gatePassNo: 202,
    date: '2026-01-02',
    variety: 'Atlantic',
    farmerStorageLinkId: farmerLink,
    totalBags: 45,
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
            name: 'Ration',
            initialQuantity: 50,
            currentQuantity: 50,
            type: 'RECEIPT',
            quantityIssued: 0,
            location: { chamber: '2', floor: '1', row: 'B' },
          },
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
  };
}

describe('outgoing report variety breakdown helpers', () => {
  const multiVarietyPass = createMultiVarietyPass();

  it('returns per-variety totals from order line resolution', () => {
    expect(getOutgoingReportVarietyBreakdown(multiVarietyPass)).toEqual([
      { variety: 'Atlantic', quantity: 20 },
      { variety: 'Chipsona', quantity: 25 },
    ]);
  });

  it('detects multiple varieties even when entry.variety is set', () => {
    expect(hasMultipleOutgoingReportVarieties(multiVarietyPass)).toBe(true);
  });

  it('returns size detail lines with location and variety', () => {
    expect(getOutgoingReportSizeQuantityDetailLines(multiVarietyPass, 'Ration')).toEqual([
      {
        variety: 'Atlantic',
        quantity: 20,
        locationLabel: '1/1/A',
      },
      {
        variety: 'Chipsona',
        quantity: 15,
        locationLabel: '2/1/B',
      },
    ]);
  });

  it('formats multi-variety breakdown for export', () => {
    expect(formatOutgoingReportVarietyBreakdownForExport(multiVarietyPass)).toBe(
      'Atlantic (20)\nChipsona (25)',
    );
  });
});

describe('expandOutgoingReportRowsByVariety', () => {
  const multiVarietyPass = createMultiVarietyPass();

  it('keeps multi-variety outgoing as a single row when not splitting', () => {
    const rows = expandOutgoingReportRowsByVariety([multiVarietyPass], 'issued', false);

    expect(rows).toHaveLength(1);
    expect(rows[0]?.varietySlice).toBeUndefined();
    expect(rows[0]?.totalBags).toBe(45);
  });

  it('splits multi-variety outgoing into one row per variety when enabled', () => {
    const rows = expandOutgoingReportRowsByVariety([multiVarietyPass], 'issued', true);

    expect(rows).toHaveLength(2);
    expect(rows.map((row) => row.varietySlice)).toEqual(['Atlantic', 'Chipsona']);
    expect(rows.map((row) => row.totalBags)).toEqual([20, 25]);
    expect(rows.map((row) => row.gatePassNo)).toEqual([202, 202]);
    expect(rows.map((row) => getOutgoingReportRowId(row))).toEqual([
      'outgoing-1\u001fAtlantic',
      'outgoing-1\u001fChipsona',
    ]);
    expect(rows[0]?.orderDetails.map((detail) => detail.size)).toEqual(['Ration']);
    expect(rows[1]?.orderDetails.map((detail) => detail.size)).toEqual(['Ration', 'Goli']);
  });
});
