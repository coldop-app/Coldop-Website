import { describe, expect, it } from 'vitest';

import type {
  DaybookEntry,
  IncomingDaybookEntry,
  OutgoingDaybookEntry,
} from '@/features/daybook/types';

import {
  applyRunningTotalsInDisplayOrder,
  buildFarmerReportRows,
  buildFarmerReportSections,
  getFarmerReportRowKey,
  splitFarmerReportEntries,
} from './build-farmer-report-sections';

const farmerLink = {
  _id: 'link-1',
  name: 'Farmer',
  accountNumber: 42,
  address: 'Addr',
  mobileNumber: '9999999999',
};

function createIncomingPass(overrides: Partial<IncomingDaybookEntry> = {}): IncomingDaybookEntry {
  return {
    _id: 'incoming-1',
    gatePassNo: 101,
    date: '2026-01-01',
    createdAt: '2026-01-01T10:00:00.000Z',
    type: 'RECEIPT',
    variety: 'Atlantic',
    status: 'active',
    farmerStorageLinkId: farmerLink,
    bagSizes: [
      {
        name: 'Ration',
        initialQuantity: 100,
        currentQuantity: 100,
        location: { chamber: '1', floor: '1', row: 'A' },
      },
    ],
    ...overrides,
  };
}

function createOutgoingPass(overrides: Partial<OutgoingDaybookEntry> = {}): OutgoingDaybookEntry {
  return {
    _id: 'outgoing-1',
    gatePassNo: 202,
    date: '2026-01-02',
    createdAt: '2026-01-02T10:00:00.000Z',
    type: 'DELIVERY',
    variety: 'Atlantic',
    farmerStorageLinkId: farmerLink,
    orderDetails: [
      {
        size: 'Ration',
        quantityAvailable: 100,
        quantityIssued: 30,
        location: { chamber: '1', floor: '1', row: 'A' },
      },
    ],
    ...overrides,
  };
}

describe('splitFarmerReportEntries', () => {
  it('includes normal and transfer incoming/outgoing passes', () => {
    const rows: DaybookEntry[] = [
      createIncomingPass({ type: 'RECEIPT', gatePassNo: 1 }),
      createIncomingPass({
        _id: 'incoming-2',
        type: 'Incoming-transfer',
        gatePassNo: 2,
      }),
      createOutgoingPass({ type: 'DELIVERY', gatePassNo: 3 }),
      createOutgoingPass({
        _id: 'outgoing-2',
        type: 'Outgoing-transfer',
        gatePassNo: 4,
      }),
    ];

    const { incoming, outgoing } = splitFarmerReportEntries(rows);

    expect(incoming).toHaveLength(2);
    expect(outgoing).toHaveLength(2);
  });

  it('excludes nullified outgoing passes', () => {
    const rows: DaybookEntry[] = [
      createOutgoingPass({ gatePassNo: 1 }),
      createOutgoingPass({ _id: 'outgoing-null', gatePassNo: 2, isNull: true }),
    ];

    const { outgoing } = splitFarmerReportEntries(rows);

    expect(outgoing).toHaveLength(1);
    expect(outgoing[0]?.gatePassNo).toBe(1);
  });

  it('sorts entries oldest first', () => {
    const rows: DaybookEntry[] = [
      createIncomingPass({
        _id: 'incoming-new',
        gatePassNo: 3,
        createdAt: '2026-03-01T10:00:00.000Z',
      }),
      createIncomingPass({
        _id: 'incoming-old',
        gatePassNo: 1,
        createdAt: '2026-01-01T10:00:00.000Z',
      }),
      createIncomingPass({
        _id: 'incoming-mid',
        gatePassNo: 2,
        createdAt: '2026-02-01T10:00:00.000Z',
      }),
    ];

    const { incoming } = splitFarmerReportEntries(rows);

    expect(incoming.map((entry) => entry.gatePassNo)).toEqual([1, 2, 3]);
  });
});

describe('buildFarmerReportRows', () => {
  it('accumulates running totals for incoming rows', () => {
    const rows = [
      createIncomingPass({
        _id: 'incoming-a',
        gatePassNo: 1,
        bagSizes: [
          {
            name: 'Ration',
            initialQuantity: 100,
            currentQuantity: 100,
            location: { chamber: '1', floor: '1', row: 'A' },
          },
        ],
      }),
      createIncomingPass({
        _id: 'incoming-b',
        gatePassNo: 2,
        bagSizes: [
          {
            name: 'Ration',
            initialQuantity: 50,
            currentQuantity: 50,
            location: { chamber: '1', floor: '1', row: 'A' },
          },
        ],
      }),
    ];

    const result = buildFarmerReportRows(rows, 'incoming');

    expect(result.map((row) => row.runningTotal)).toEqual([100, 150]);
  });

  it('subtracts from starting balance for outgoing rows', () => {
    const rows = [
      createOutgoingPass({
        gatePassNo: 1,
        orderDetails: [
          {
            size: 'Ration',
            quantityAvailable: 150,
            quantityIssued: 30,
            location: { chamber: '1', floor: '1', row: 'A' },
          },
        ],
      }),
    ];

    const result = buildFarmerReportRows(rows, 'outgoing', 150);

    expect(result[0]?.runningTotal).toBe(120);
  });
});

describe('buildFarmerReportSections', () => {
  it('carries incoming closing balance into outgoing section', () => {
    const rows: DaybookEntry[] = [
      createIncomingPass({
        gatePassNo: 1,
        bagSizes: [
          {
            name: 'Ration',
            initialQuantity: 100,
            currentQuantity: 100,
            location: { chamber: '1', floor: '1', row: 'A' },
          },
        ],
      }),
      createIncomingPass({
        _id: 'incoming-2',
        gatePassNo: 2,
        createdAt: '2026-02-01T10:00:00.000Z',
        bagSizes: [
          {
            name: 'Ration',
            initialQuantity: 50,
            currentQuantity: 50,
            location: { chamber: '1', floor: '1', row: 'A' },
          },
        ],
      }),
      createOutgoingPass({
        gatePassNo: 3,
        createdAt: '2026-03-01T10:00:00.000Z',
        orderDetails: [
          {
            size: 'Ration',
            quantityAvailable: 150,
            quantityIssued: 30,
            location: { chamber: '1', floor: '1', row: 'A' },
          },
        ],
      }),
    ];

    const sections = buildFarmerReportSections(rows);

    expect(sections.incomingClosingBalance).toBe(150);
    expect(sections.incoming.map((row) => row.runningTotal)).toEqual([100, 150]);
    expect(sections.outgoing).toHaveLength(2);
    expect(sections.outgoing[0]?.kind).toBe('opening-balance');
    expect(sections.outgoing[0]?.runningTotal).toBe(150);
    expect(sections.outgoing[0]?.sizeTotals).toEqual({ Ration: 150 });
    expect(sections.outgoing[1]?.kind).toBe('gate-pass');
    expect(sections.outgoing[1]?.runningTotal).toBe(120);
  });

  it('does not add opening balance row when there is no incoming stock', () => {
    const rows: DaybookEntry[] = [
      createOutgoingPass({
        gatePassNo: 1,
        orderDetails: [
          {
            size: 'Ration',
            quantityAvailable: 30,
            quantityIssued: 30,
            location: { chamber: '1', floor: '1', row: 'A' },
          },
        ],
      }),
    ];

    const sections = buildFarmerReportSections(rows);

    expect(sections.outgoing).toHaveLength(1);
    expect(sections.outgoing[0]?.kind).toBe('gate-pass');
    expect(sections.outgoing[0]?.runningTotal).toBe(-30);
  });

  it('keeps multi-variety outgoing as a single row when not splitting', () => {
    const rows: DaybookEntry[] = [createIncomingPass(), createMultiVarietyOutgoingPass()];

    const sections = buildFarmerReportSections(rows);
    const gatePassRows = sections.outgoing.filter((row) => row.kind === 'gate-pass');

    expect(gatePassRows).toHaveLength(1);
    expect(gatePassRows[0]?.varietySlice).toBeUndefined();
    expect(gatePassRows[0]?.rowBags).toBe(45);
  });

  it('splits multi-variety outgoing into one row per variety when enabled', () => {
    const rows: DaybookEntry[] = [createIncomingPass(), createMultiVarietyOutgoingPass()];

    const sections = buildFarmerReportSections(rows, {
      splitOutgoingByVariety: true,
    });
    const gatePassRows = sections.outgoing.filter((row) => row.kind === 'gate-pass');

    expect(gatePassRows).toHaveLength(2);
    expect(gatePassRows.map((row) => row.varietySlice)).toEqual(['Atlantic', 'Chipsona']);
    expect(gatePassRows.map((row) => row.rowBags)).toEqual([20, 25]);
    expect(gatePassRows.map((row) => row.entry?.gatePassNo)).toEqual([202, 202]);
    expect(gatePassRows.map((row) => getFarmerReportRowKey(row))).toEqual([
      'outgoing-1:Atlantic',
      'outgoing-1:Chipsona',
    ]);
    expect(gatePassRows[1]?.runningTotal).toBe(55);
  });
});

function createMultiVarietyOutgoingPass(): OutgoingDaybookEntry {
  return createOutgoingPass({
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
  });
}

describe('applyRunningTotalsInDisplayOrder', () => {
  it('recomputes outgoing totals for grouped display order', () => {
    const rows: DaybookEntry[] = [
      createIncomingPass({
        gatePassNo: 1,
        bagSizes: [
          {
            name: 'Ration',
            initialQuantity: 100,
            currentQuantity: 100,
            location: { chamber: '1', floor: '1', row: 'A' },
          },
        ],
      }),
      createOutgoingPass({
        _id: 'outgoing-atlantic',
        gatePassNo: 2,
        createdAt: '2026-02-01T10:00:00.000Z',
        variety: 'Atlantic',
        orderDetails: [
          {
            size: 'Ration',
            quantityAvailable: 100,
            quantityIssued: 10,
            location: { chamber: '1', floor: '1', row: 'A' },
          },
        ],
      }),
      createOutgoingPass({
        _id: 'outgoing-cardinal',
        gatePassNo: 3,
        createdAt: '2026-03-01T10:00:00.000Z',
        variety: 'Cardinal',
        orderDetails: [
          {
            size: 'Ration',
            quantityAvailable: 90,
            quantityIssued: 20,
            location: { chamber: '1', floor: '1', row: 'A' },
          },
        ],
      }),
      createOutgoingPass({
        _id: 'outgoing-atlantic-2',
        gatePassNo: 4,
        createdAt: '2026-04-01T10:00:00.000Z',
        variety: 'Atlantic',
        orderDetails: [
          {
            size: 'Ration',
            quantityAvailable: 70,
            quantityIssued: 5,
            location: { chamber: '1', floor: '1', row: 'A' },
          },
        ],
      }),
    ];

    const sections = buildFarmerReportSections(rows);
    const openingBalance = sections.outgoing[0]!;
    const atlanticPass = sections.outgoing[1]!;
    const cardinalPass = sections.outgoing[2]!;
    const atlanticPass2 = sections.outgoing[3]!;

    const totals = applyRunningTotalsInDisplayOrder(
      [openingBalance, cardinalPass, atlanticPass, atlanticPass2],
      'outgoing',
      100,
    );

    expect(totals.get('opening-balance')).toBe(100);
    expect(totals.get('outgoing-cardinal')).toBe(80);
    expect(totals.get('outgoing-atlantic')).toBe(70);
    expect(totals.get('outgoing-atlantic-2')).toBe(65);
  });
});
