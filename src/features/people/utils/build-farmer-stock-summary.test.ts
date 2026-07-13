import { describe, expect, it } from 'vitest';

import type { IncomingDaybookEntry, OutgoingDaybookEntry } from '@/features/daybook/types';

import {
  buildFarmerStockSummary,
  buildStockSummaryCellBreakdown,
  filterPassesByStockFilter,
  resolveSizeColumns,
} from './build-farmer-stock-summary';

const commodities = [
  {
    name: 'Potato',
    varieties: ['Atlantic', 'Cardinal'],
    sizes: ['Ration', 'Seed', 'Goli'],
  },
];

function createPass(
  overrides: Partial<IncomingDaybookEntry> & {
    variety: string;
    bagSizes: NonNullable<IncomingDaybookEntry['bagSizes']>;
  },
): IncomingDaybookEntry {
  return {
    _id: 'pass-1',
    farmerStorageLinkId: {
      _id: 'link-1',
      name: 'Farmer',
      accountNumber: 1,
      address: 'Addr',
      mobileNumber: '9999999999',
    },
    createdBy: { _id: 'user-1', name: 'Admin' },
    gatePassNo: 1,
    date: '2026-01-01',
    type: 'RECEIPT',
    status: 'active',
    createdAt: '2026-01-01',
    ...overrides,
  };
}

describe('filterPassesByStockFilter', () => {
  const passes = [
    createPass({
      variety: 'Atlantic',
      stockFilter: 'Owned',
      bagSizes: [
        {
          name: 'Ration',
          initialQuantity: 10,
          currentQuantity: 5,
          location: { chamber: '1', floor: '1', row: 'A' },
        },
      ],
    }),
    createPass({
      _id: 'pass-2',
      variety: 'Cardinal',
      stockFilter: 'Farmer',
      bagSizes: [
        {
          name: 'Ration',
          initialQuantity: 3,
          currentQuantity: 3,
          location: { chamber: '1', floor: '1', row: 'B' },
        },
      ],
    }),
  ];

  it('returns all passes for the all tab', () => {
    expect(filterPassesByStockFilter(passes, 'all')).toHaveLength(2);
  });

  it('filters by stock filter option', () => {
    expect(filterPassesByStockFilter(passes, 'Owned')).toHaveLength(1);
    expect(filterPassesByStockFilter(passes, 'Owned')[0]?.variety).toBe('Atlantic');
  });
});

describe('resolveSizeColumns', () => {
  it('orders known sizes by preference and appends extras from data', () => {
    const passes = [
      createPass({
        variety: 'Atlantic',
        bagSizes: [
          {
            name: 'Cut-tok',
            initialQuantity: 1,
            currentQuantity: 1,
            location: { chamber: '1', floor: '1', row: 'A' },
          },
          {
            name: 'Ration',
            initialQuantity: 1,
            currentQuantity: 1,
            location: { chamber: '1', floor: '1', row: 'A' },
          },
        ],
      }),
    ];

    expect(resolveSizeColumns(passes, commodities)).toEqual(['Ration', 'Seed', 'Goli', 'Cut-tok']);
  });
});

describe('buildFarmerStockSummary', () => {
  const passes = [
    createPass({
      variety: 'Atlantic',
      stockFilter: 'Owned',
      bagSizes: [
        {
          name: 'Ration',
          initialQuantity: 100,
          currentQuantity: 80,
          location: { chamber: '1', floor: '1', row: 'A' },
        },
        {
          name: 'Goli',
          initialQuantity: 50,
          currentQuantity: 20,
          location: { chamber: '1', floor: '1', row: 'A' },
        },
      ],
    }),
    createPass({
      _id: 'pass-2',
      variety: 'Cardinal',
      stockFilter: 'Farmer',
      bagSizes: [
        {
          name: 'Ration',
          initialQuantity: 10,
          currentQuantity: 3,
          location: { chamber: '1', floor: '1', row: 'B' },
        },
      ],
    }),
  ];

  it('aggregates current quantities by variety and size', () => {
    const summary = buildFarmerStockSummary({
      passes,
      commodities,
      stockFilterTab: 'all',
      quantityMode: 'current',
    });

    expect(summary.rows).toHaveLength(2);
    expect(summary.rows[0]).toMatchObject({
      variety: 'Atlantic',
      bySize: { Ration: 80, Seed: 0, Goli: 20 },
      total: 100,
    });
    expect(summary.footerBySize).toMatchObject({
      Ration: 83,
      Goli: 20,
    });
    expect(summary.grandTotal).toBe(103);
    expect(summary.modeTotals).toEqual({
      current: 103,
      initial: 160,
      outgoing: 57,
    });
  });

  it('uses outgoing mode as initial minus current', () => {
    const summary = buildFarmerStockSummary({
      passes,
      commodities,
      stockFilterTab: 'all',
      quantityMode: 'outgoing',
    });

    expect(summary.rows[0]?.bySize).toMatchObject({
      Ration: 20,
      Goli: 30,
    });
    expect(summary.grandTotal).toBe(57);
  });

  it('respects stock filter tab when building matrix', () => {
    const summary = buildFarmerStockSummary({
      passes,
      commodities,
      stockFilterTab: 'Owned',
      quantityMode: 'current',
    });

    expect(summary.rows).toHaveLength(1);
    expect(summary.rows[0]?.variety).toBe('Atlantic');
    expect(summary.grandTotal).toBe(100);
  });
});

describe('buildStockSummaryCellBreakdown', () => {
  const passes = [
    createPass({
      gatePassNo: 18,
      variety: 'Chipsona 1',
      bagSizes: [
        {
          name: 'Goli',
          initialQuantity: 60,
          currentQuantity: 60,
          location: { chamber: '2', floor: '3', row: '1' },
        },
      ],
    }),
    createPass({
      _id: 'pass-2',
      gatePassNo: 32,
      variety: 'Chipsona 1',
      bagSizes: [
        {
          name: 'Goli',
          initialQuantity: 70,
          currentQuantity: 70,
          location: { chamber: '1', floor: '3', row: '2' },
        },
        {
          name: 'Goli',
          initialQuantity: 70,
          currentQuantity: 70,
          location: { chamber: '1', floor: '3', row: '2' },
        },
      ],
    }),
  ];

  it('includes manual parchi on incoming breakdown lines', () => {
    const lines = buildStockSummaryCellBreakdown({
      passes: [
        createPass({
          gatePassNo: 18,
          manualParchiNumber: 'P-4521',
          variety: 'Chipsona 1',
          bagSizes: [
            {
              name: 'Goli',
              initialQuantity: 60,
              currentQuantity: 60,
              location: { chamber: '2', floor: '3', row: '1' },
            },
          ],
        }),
      ],
      stockFilterTab: 'all',
      quantityMode: 'current',
      variety: 'Chipsona 1',
      size: 'Goli',
    });

    expect(lines[0]?.manualParchiNumber).toBe('P-4521');
  });

  it('returns breakdown lines for a variety and size cell', () => {
    const lines = buildStockSummaryCellBreakdown({
      passes,
      stockFilterTab: 'all',
      quantityMode: 'current',
      variety: 'Chipsona 1',
      size: 'Goli',
    });

    expect(lines).toHaveLength(3);
    expect(lines[0]).toMatchObject({
      variety: 'Chipsona 1',
      size: 'Goli',
      location: '2/3/1',
      quantity: 60,
      gatePassNo: 18,
    });
    expect(lines[1]).toMatchObject({
      location: '1/3/2',
      quantity: 70,
      gatePassNo: 32,
    });
  });

  it('uses outgoing quantities in outgoing mode', () => {
    const outgoingPasses = [
      createPass({
        variety: 'Atlantic',
        bagSizes: [
          {
            name: 'Ration',
            initialQuantity: 100,
            currentQuantity: 80,
            location: { chamber: '1', floor: '1', row: 'A' },
          },
        ],
      }),
    ];

    const lines = buildStockSummaryCellBreakdown({
      passes: outgoingPasses,
      stockFilterTab: 'all',
      quantityMode: 'outgoing',
      variety: 'Atlantic',
      size: 'Ration',
    });

    expect(lines).toHaveLength(0);
  });

  it('uses outgoing gate pass details in outgoing mode', () => {
    const incomingPasses = [
      createPass({
        _id: 'incoming-1',
        gatePassNo: 101,
        variety: 'Atlantic',
        bagSizes: [
          {
            name: 'Ration',
            initialQuantity: 100,
            currentQuantity: 70,
            location: { chamber: '1', floor: '1', row: 'A' },
          },
        ],
      }),
    ];

    const outgoingGatePasses: OutgoingDaybookEntry[] = [
      {
        _id: 'outgoing-1',
        gatePassNo: 202,
        manualParchiNumber: 'OGP-55',
        date: '2026-01-02',
        createdAt: '2026-01-02T10:00:00.000Z',
        farmerStorageLinkId: incomingPasses[0]!.farmerStorageLinkId,
        orderDetails: [
          {
            size: 'Ration',
            quantityAvailable: 80,
            quantityIssued: 30,
            location: { chamber: '1', floor: '1', row: 'A' },
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
                currentQuantity: 70,
                type: 'Ration',
                quantityIssued: 30,
                location: { chamber: '1', floor: '1', row: 'A' },
              },
            ],
          },
        ],
      },
    ];

    const lines = buildStockSummaryCellBreakdown({
      passes: incomingPasses,
      outgoingPasses: outgoingGatePasses,
      stockFilterTab: 'all',
      quantityMode: 'outgoing',
      variety: 'Atlantic',
      size: 'Ration',
    });

    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({
      variety: 'Atlantic',
      size: 'Ration',
      location: '1/1/A',
      quantity: 30,
      gatePassNo: 202,
      reference: '101',
      manualGatePassNumber: 'OGP-55',
    });
  });

  it('resolves outgoing passes from allEntries when outgoingPasses is omitted', () => {
    const incomingPasses = [
      createPass({
        _id: 'incoming-1',
        gatePassNo: 26,
        variety: 'Chipsona 1',
        bagSizes: [
          {
            name: 'Goli',
            initialQuantity: 10,
            currentQuantity: 0,
            location: { chamber: '1', floor: '1', row: '4' },
          },
        ],
      }),
    ];

    const allEntries = [
      ...incomingPasses,
      {
        _id: 'outgoing-1',
        gatePassNo: 8,
        date: '2026-01-02',
        createdAt: '2026-01-02T10:00:00.000Z',
        farmerStorageLinkId: incomingPasses[0]!.farmerStorageLinkId,
        orderDetails: [
          {
            size: 'Goli',
            quantityAvailable: 10,
            quantityIssued: 10,
            location: { chamber: '1', floor: '1', row: '4' },
          },
        ],
        incomingGatePassSnapshots: [
          {
            _id: 'incoming-1',
            gatePassNo: 26,
            variety: 'Chipsona 1',
            bagSizes: [
              {
                name: 'Goli',
                initialQuantity: 10,
                currentQuantity: 0,
                type: 'Goli',
                quantityIssued: 10,
                location: { chamber: '1', floor: '1', row: '4' },
              },
            ],
          },
        ],
      } satisfies OutgoingDaybookEntry,
    ];

    const lines = buildStockSummaryCellBreakdown({
      passes: incomingPasses,
      allEntries,
      stockFilterTab: 'all',
      quantityMode: 'outgoing',
      variety: 'Chipsona 1',
      size: 'Goli',
    });

    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({
      gatePassNo: 8,
      reference: '26',
      quantity: 10,
    });
  });
});
