import { describe, expect, it } from 'vitest';

import type {
  DaybookEntry,
  IncomingDaybookEntry,
  OutgoingDaybookEntry,
} from '@/features/daybook/types';

import { buildFarmerReportSections } from './build-farmer-report-sections';
import {
  buildFarmerStockLedgerPdfData,
  formatPdfVarietyValue,
  type PdfLedgerItem,
  type PdfLedgerLeafRow,
} from './build-farmer-stock-ledger-pdf-data';

const farmerLink = {
  _id: 'link-1',
  name: 'Tirlok Singh',
  accountNumber: 42,
  address: 'Village Raipur',
  mobileNumber: '9876543210',
};

const EMPTY_SUMMARIES = {
  totalIncomingBags: 0,
  totalOutgoingBags: 0,
  totalInternallyTransferredIncomingBags: 0,
  totalInternallyTransferredOutgoingBags: 0,
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
        currentQuantity: 80,
        location: { chamber: '1', floor: '1', row: 'A' },
      },
      {
        name: 'Seed',
        initialQuantity: 50,
        currentQuantity: 50,
        location: { chamber: '1', floor: '2', row: 'B' },
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
        quantityAvailable: 80,
        quantityIssued: 30,
        location: { chamber: '1', floor: '1', row: 'A' },
      },
    ],
    ...overrides,
  };
}

const commodities = [
  {
    name: 'Potato',
    varieties: ['Atlantic'],
    sizes: ['Ration', 'Seed', 'Goli'],
  },
];

const search = {
  tab: 'incoming' as const,
  name: 'Tirlok Singh',
  address: 'Village Raipur',
  mobileNumber: '9876543210',
  accountNumber: 42,
};

function expectLeafRow(row: PdfLedgerItem | undefined): asserts row is PdfLedgerLeafRow {
  expect(row?.kind).toBe('leaf');
}

describe('buildFarmerStockLedgerPdfData', () => {
  it('builds stock summary using current quantity only', () => {
    const entries: DaybookEntry[] = [createIncomingPass()];
    const sections = buildFarmerReportSections(entries);

    const result = buildFarmerStockLedgerPdfData({
      entries,
      sections,
      summaries: {
        ...EMPTY_SUMMARIES,
        totalIncomingBags: 150,
      },
      commodities,
      search,
      generatedAt: new Date('2026-06-23T10:00:00.000Z'),
    });

    expect(result.stockSummary.grandTotal).toBe(130);
    expect(result.stockSummary.rows[0]?.bySize.Ration).toBe(80);
    expect(result.stockSummary.rows[0]?.bySize.Seed).toBe(50);
  });

  it('maps opening balance row for outgoing ledger', () => {
    const entries: DaybookEntry[] = [
      createIncomingPass({ gatePassNo: 1 }),
      createOutgoingPass({ gatePassNo: 2 }),
    ];
    const sections = buildFarmerReportSections(entries);

    const result = buildFarmerStockLedgerPdfData({
      entries,
      sections,
      summaries: {
        ...EMPTY_SUMMARIES,
        totalIncomingBags: 150,
        totalOutgoingBags: 30,
      },
      commodities,
      search,
    });

    const openingRow = result.outgoingLedger[0];
    expectLeafRow(openingRow);
    expect(openingRow.isOpeningBalance).toBe(true);
    expect(openingRow.date).toBe('Opening Balance');
    expect(openingRow.sizes.Ration).toEqual({
      type: 'plain',
      value: '100',
    });
    expect(result.outgoingClosingBalance).toBe(120);
  });

  it('orders size columns from commodity preferences', () => {
    const entries: DaybookEntry[] = [
      createIncomingPass({
        bagSizes: [
          {
            name: 'Goli',
            initialQuantity: 10,
            currentQuantity: 10,
            location: { chamber: '1', floor: '1', row: 'A' },
          },
          {
            name: 'Ration',
            initialQuantity: 20,
            currentQuantity: 20,
            location: { chamber: '1', floor: '1', row: 'A' },
          },
        ],
      }),
    ];
    const sections = buildFarmerReportSections(entries);

    const result = buildFarmerStockLedgerPdfData({
      entries,
      sections,
      summaries: { ...EMPTY_SUMMARIES, totalIncomingBags: 30 },
      commodities,
      search,
    });

    expect(result.sizeColumns.slice(0, 2)).toEqual(['Ration', 'Goli']);
    expect(result.sizeColumns).toContain('Goli');
    expect(result.sizeColumns).not.toContain('Seed');
  });

  it('uses running totals for incoming ledger rows', () => {
    const entries: DaybookEntry[] = [
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
    ];
    const sections = buildFarmerReportSections(entries);

    const result = buildFarmerStockLedgerPdfData({
      entries,
      sections,
      summaries: { ...EMPTY_SUMMARIES, totalIncomingBags: 150 },
      commodities,
      search,
    });

    expect(
      result.incomingLedger
        .filter((row): row is PdfLedgerLeafRow => row.kind === 'leaf')
        .map((row) => row.rowBags),
    ).toEqual(['100', '50']);
    expect(
      result.incomingLedger
        .filter((row): row is PdfLedgerLeafRow => row.kind === 'leaf')
        .map((row) => row.total),
    ).toEqual(['100', '150']);
    expect(result.incomingClosingBalance).toBe(150);
  });

  it('maps stock filter and custom marka when enabled', () => {
    const entries: DaybookEntry[] = [
      createIncomingPass({
        stockFilter: 'Own Stock',
        customMarka: 'TS-42',
      }),
    ];
    const sections = buildFarmerReportSections(entries);

    const result = buildFarmerStockLedgerPdfData({
      entries,
      sections,
      summaries: { ...EMPTY_SUMMARIES, totalIncomingBags: 150 },
      commodities,
      search,
      showStockFilter: true,
      showCustomMarka: true,
    });

    expect(result.showStockFilter).toBe(true);
    expect(result.showCustomMarka).toBe(true);
    const incomingRow = result.incomingLedger[0];
    expectLeafRow(incomingRow);
    expect(incomingRow.stockFilter).toBe('Own Stock');
    expect(incomingRow.customMarka).toBe('TS-42');
  });

  it('maps outgoing stock filter when enabled', () => {
    const entries: DaybookEntry[] = [
      createOutgoingPass({
        stockFilter: 'Farmer',
      }),
    ];
    const sections = buildFarmerReportSections(entries);

    const result = buildFarmerStockLedgerPdfData({
      entries,
      sections,
      summaries: { ...EMPTY_SUMMARIES, totalOutgoingBags: 40 },
      commodities: [],
      search,
      showStockFilter: true,
      showCustomMarka: false,
    });

    const outgoingRow = result.outgoingLedger[0];
    expectLeafRow(outgoingRow);
    expect(outgoingRow.stockFilter).toBe('Farmer');
  });

  it('maps multi-variety outgoing rows with a full breakdown', () => {
    const entries: DaybookEntry[] = [
      createOutgoingPass({
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
      }),
    ];
    const sections = buildFarmerReportSections(entries);

    const result = buildFarmerStockLedgerPdfData({
      entries,
      sections,
      summaries: { ...EMPTY_SUMMARIES, totalOutgoingBags: 45 },
      commodities,
      search,
    });

    const outgoingRow = result.outgoingLedger[0];
    expectLeafRow(outgoingRow);
    expect(outgoingRow.variety).toEqual({
      type: 'breakdown',
      lines: [
        { variety: 'Atlantic', quantity: '20' },
        { variety: 'Chipsona', quantity: '25' },
      ],
    });
    expect(formatPdfVarietyValue(outgoingRow.variety)).toBe('Atlantic (20)\nChipsona (25)');
  });

  it('maps variety-sliced outgoing rows as plain variety lines', () => {
    const entries: DaybookEntry[] = [
      createOutgoingPass({
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
      }),
    ];
    const sections = buildFarmerReportSections(entries, {
      splitOutgoingByVariety: true,
    });

    const result = buildFarmerStockLedgerPdfData({
      entries,
      sections,
      summaries: { ...EMPTY_SUMMARIES, totalOutgoingBags: 45 },
      commodities,
      search,
    });

    const leafRows = result.outgoingLedger.filter(
      (item): item is PdfLedgerLeafRow => item.kind === 'leaf',
    );

    expect(leafRows).toHaveLength(2);
    expect(leafRows.map((row) => row.variety)).toEqual([
      { type: 'plain', value: 'Atlantic' },
      { type: 'plain', value: 'Chipsona' },
    ]);
    expect(leafRows.map((row) => row.rowBags)).toEqual(['20', '25']);
    expect(leafRows.map((row) => row.gatePass)).toEqual(['#202', '#202']);
  });
});
