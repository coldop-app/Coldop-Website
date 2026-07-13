import { describe, expect, it } from 'vitest';

import type {
  DaybookEntry,
  IncomingDaybookEntry,
  OutgoingDaybookEntry,
} from '@/features/daybook/types';

import {
  collectUniqueBagSizes,
  formatOutgoingVarietyBreakdownForExport,
  getGatePassSizeQuantity,
  getGatePassSizeQuantityLines,
  getGatePassStockFilter,
  getGatePassTotalBags,
  getGatePassVariety,
  getOutgoingSizeQuantityDetailLines,
  getOutgoingSizeQuantityForVariety,
  getOutgoingSizeQuantityLinesByVariety,
  getOutgoingSizeQuantityLinesForVariety,
  getOutgoingVarietyBreakdown,
  hasMultipleOutgoingVarieties,
  orderBagSizes,
  sumSizeColumn,
  sumTotalBags,
} from './gate-pass-table-helpers';

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
      {
        size: 'Goli',
        quantityAvailable: 10,
        quantityIssued: 10,
        location: { chamber: '2', floor: '1', row: 'C' },
      },
    ],
    ...overrides,
  };
}

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

describe('collectUniqueBagSizes', () => {
  it('collects sizes from incoming and outgoing entries', () => {
    const rows: DaybookEntry[] = [createIncomingPass(), createOutgoingPass()];

    expect(collectUniqueBagSizes(rows).sort()).toEqual(['Goli', 'Ration', 'Seed']);
  });

  it('returns empty array when no bag sizes exist', () => {
    expect(
      collectUniqueBagSizes([
        createIncomingPass({ bagSizes: [] }),
        createOutgoingPass({ orderDetails: [] }),
      ]),
    ).toEqual([]);
  });
});

describe('orderBagSizes', () => {
  const commodities = [
    {
      name: 'Potato',
      varieties: ['Atlantic'],
      sizes: ['Seed', 'Ration', 'Goli'],
    },
  ];

  it('orders sizes by commodity preference', () => {
    expect(orderBagSizes(['Goli', 'Ration', 'Seed'], commodities)).toEqual([
      'Seed',
      'Ration',
      'Goli',
    ]);
  });
});

describe('getGatePassVariety', () => {
  it('returns incoming variety', () => {
    expect(getGatePassVariety(createIncomingPass({ variety: 'Atlantic' }))).toBe('Atlantic');
  });

  it('falls back to incoming snapshot variety for outgoing passes', () => {
    expect(
      getGatePassVariety(
        createOutgoingPass({
          variety: undefined,
          incomingGatePassSnapshots: [
            {
              _id: 'incoming-1',
              gatePassNo: 101,
              variety: 'Chipsona',
              bagSizes: [],
            },
          ],
        }),
      ),
    ).toBe('Chipsona');
  });

  it('prefers outgoing variety when present', () => {
    expect(
      getGatePassVariety(
        createOutgoingPass({
          variety: 'Atlantic',
          incomingGatePassSnapshots: [
            {
              _id: 'incoming-1',
              gatePassNo: 101,
              variety: 'Chipsona',
              bagSizes: [],
            },
          ],
        }),
      ),
    ).toBe('Atlantic');
  });

  it('joins multiple snapshot varieties for outgoing passes', () => {
    expect(
      getGatePassVariety(
        createOutgoingPass({
          variety: undefined,
          incomingGatePassSnapshots: [
            {
              _id: 'incoming-1',
              gatePassNo: 101,
              variety: 'Atlantic',
              bagSizes: [],
            },
            {
              _id: 'incoming-2',
              gatePassNo: 102,
              variety: 'Chipsona',
              bagSizes: [],
            },
          ],
        }),
      ),
    ).toBe('Atlantic, Chipsona');
  });

  it('deduplicates snapshot varieties for outgoing passes', () => {
    expect(
      getGatePassVariety(
        createOutgoingPass({
          variety: undefined,
          incomingGatePassSnapshots: [
            {
              _id: 'incoming-1',
              gatePassNo: 101,
              variety: 'Atlantic',
              bagSizes: [],
            },
            {
              _id: 'incoming-2',
              gatePassNo: 102,
              variety: 'Atlantic',
              bagSizes: [],
            },
          ],
        }),
      ),
    ).toBe('Atlantic');
  });
});

describe('getGatePassStockFilter', () => {
  it('returns stock filter for incoming and outgoing entries', () => {
    expect(getGatePassStockFilter(createIncomingPass({ stockFilter: 'Owned' }))).toBe('Owned');
    expect(getGatePassStockFilter(createOutgoingPass({ stockFilter: 'Farmer' }))).toBe('Farmer');
  });

  it('returns em dash when stock filter is absent', () => {
    expect(getGatePassStockFilter(createOutgoingPass())).toBe('—');
  });
});

describe('getGatePassSizeQuantity', () => {
  it('returns incoming initial quantity for matching size', () => {
    expect(getGatePassSizeQuantity(createIncomingPass(), 'Ration')).toBe(100);
    expect(getGatePassSizeQuantity(createIncomingPass(), 'Seed')).toBe(50);
  });

  it('returns outgoing issued quantity for matching size', () => {
    expect(getGatePassSizeQuantity(createOutgoingPass(), 'Ration')).toBe(30);
    expect(getGatePassSizeQuantity(createOutgoingPass(), 'Goli')).toBe(10);
  });

  it('returns null when size is not on the pass', () => {
    expect(getGatePassSizeQuantity(createIncomingPass(), 'Goli')).toBeNull();
    expect(getGatePassSizeQuantity(createOutgoingPass(), 'Seed')).toBeNull();
  });
});

describe('getGatePassTotalBags', () => {
  it('sums incoming initial quantities', () => {
    expect(getGatePassTotalBags(createIncomingPass())).toBe(150);
  });

  it('sums outgoing issued quantities', () => {
    expect(getGatePassTotalBags(createOutgoingPass())).toBe(40);
  });
});

describe('getGatePassSizeQuantityLines', () => {
  it('returns quantity and location lines for incoming entries', () => {
    const lines = getGatePassSizeQuantityLines(createIncomingPass(), 'Ration');

    expect(lines).toEqual([
      {
        quantity: 100,
        locationLabel: '1/1/A',
      },
    ]);
  });

  it('merges quantities at the same location', () => {
    const lines = getGatePassSizeQuantityLines(
      createIncomingPass({
        bagSizes: [
          {
            name: 'Ration',
            initialQuantity: 60,
            currentQuantity: 60,
            location: { chamber: '1', floor: '1', row: 'A' },
          },
          {
            name: 'Ration',
            initialQuantity: 40,
            currentQuantity: 40,
            location: { chamber: '1', floor: '1', row: 'A' },
          },
        ],
      }),
      'Ration',
    );

    expect(lines).toEqual([
      {
        quantity: 100,
        locationLabel: '1/1/A',
      },
    ]);
  });

  it('returns separate lines for different locations', () => {
    const lines = getGatePassSizeQuantityLines(createIncomingPass(), 'Seed');

    expect(lines).toEqual([
      {
        quantity: 50,
        locationLabel: '1/2/B',
      },
    ]);
  });

  it('returns outgoing issued quantity lines', () => {
    const lines = getGatePassSizeQuantityLines(createOutgoingPass(), 'Ration');

    expect(lines).toEqual([
      {
        quantity: 30,
        locationLabel: '1/1/A',
      },
    ]);
  });
});

describe('outgoing variety breakdown helpers', () => {
  const multiVarietyPass = createMultiVarietyOutgoingPass();

  it('returns per-variety totals from order line resolution', () => {
    expect(getOutgoingVarietyBreakdown(multiVarietyPass)).toEqual([
      { variety: 'Atlantic', quantity: 20 },
      { variety: 'Chipsona', quantity: 25 },
    ]);
  });

  it('detects multiple varieties from order lines even when entry.variety is set', () => {
    expect(hasMultipleOutgoingVarieties(multiVarietyPass)).toBe(true);
    expect(hasMultipleOutgoingVarieties(createOutgoingPass())).toBe(false);
  });

  it('splits size quantities by variety', () => {
    expect(getOutgoingSizeQuantityLinesByVariety(multiVarietyPass, 'Ration')).toEqual([
      {
        variety: 'Atlantic',
        quantity: 20,
        locationLines: [{ quantity: 20, locationLabel: '1/1/A' }],
      },
      {
        variety: 'Chipsona',
        quantity: 15,
        locationLines: [{ quantity: 15, locationLabel: '2/1/B' }],
      },
    ]);
  });

  it('returns variety lines for sizes dispatched from a single variety', () => {
    expect(getOutgoingSizeQuantityLinesByVariety(multiVarietyPass, 'Goli')).toEqual([
      {
        variety: 'Chipsona',
        quantity: 10,
        locationLines: [{ quantity: 10, locationLabel: '2/1/C' }],
      },
    ]);
  });

  it('flattens size detail lines with location and variety', () => {
    expect(getOutgoingSizeQuantityDetailLines(multiVarietyPass, 'Ration')).toEqual([
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

  it('returns size quantity for a single variety slice', () => {
    expect(getOutgoingSizeQuantityForVariety(multiVarietyPass, 'Ration', 'Atlantic')).toBe(20);
    expect(getOutgoingSizeQuantityForVariety(multiVarietyPass, 'Ration', 'Chipsona')).toBe(15);
    expect(getOutgoingSizeQuantityForVariety(multiVarietyPass, 'Goli', 'Atlantic')).toBeNull();
  });

  it('returns location lines for a single variety slice', () => {
    expect(getOutgoingSizeQuantityLinesForVariety(multiVarietyPass, 'Ration', 'Atlantic')).toEqual([
      { quantity: 20, locationLabel: '1/1/A' },
    ]);
    expect(getOutgoingSizeQuantityLinesForVariety(multiVarietyPass, 'Goli', 'Chipsona')).toEqual([
      { quantity: 10, locationLabel: '2/1/C' },
    ]);
  });

  it('formats multi-variety breakdown for export', () => {
    expect(formatOutgoingVarietyBreakdownForExport(multiVarietyPass)).toBe(
      'Atlantic (20)\nChipsona (25)',
    );
    expect(formatOutgoingVarietyBreakdownForExport(createOutgoingPass())).toBe('Atlantic');
  });
});

describe('sumSizeColumn and sumTotalBags', () => {
  const rows: DaybookEntry[] = [createIncomingPass(), createOutgoingPass()];

  it('sums a size column across rows', () => {
    expect(sumSizeColumn(rows, 'Ration')).toBe(130);
    expect(sumSizeColumn(rows, 'Goli')).toBe(10);
  });

  it('sums total bags across rows', () => {
    expect(sumTotalBags(rows)).toBe(190);
  });
});
