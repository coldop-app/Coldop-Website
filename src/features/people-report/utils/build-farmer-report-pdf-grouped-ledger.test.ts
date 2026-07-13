import { describe, expect, it } from 'vitest';
import {
  createTable,
  getCoreRowModel,
  getExpandedRowModel,
  getGroupedRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';

import type { IncomingDaybookEntry, OutgoingDaybookEntry } from '@/features/daybook/types';
import {
  farmerReportSortingFns,
  getFarmerReportColumns,
} from '@/features/people-report/components/columns';
import { buildFarmerReportSections } from '@/features/people-report/utils/build-farmer-report-sections';
import {
  buildPdfGroupedLedgerItems,
  buildPdfGroupedLedgerItemsFromTable,
} from '@/features/people-report/utils/build-farmer-report-pdf-grouped-ledger';

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

const sizeColumns = ['Ration'];

describe('buildPdfGroupedLedgerItems', () => {
  it('returns flat leaf rows when grouping is empty', () => {
    const entries = [
      createIncomingPass({ gatePassNo: 1 }),
      createIncomingPass({
        _id: 'incoming-2',
        gatePassNo: 2,
        variety: 'Jyoti',
      }),
    ];
    const sections = buildFarmerReportSections(entries);
    const columns = getFarmerReportColumns(entries, [], false, true);

    const result = buildPdfGroupedLedgerItems({
      rows: sections.incoming,
      columns,
      grouping: [],
      sizeColumns,
      sectionMode: 'incoming',
    });

    expect(result.openingBalanceRows).toHaveLength(0);
    expect(result.items).toHaveLength(2);
    expect(result.items.every((item) => item.kind === 'leaf')).toBe(true);
  });

  it('groups incoming rows by variety with aggregated totals', () => {
    const entries = [
      createIncomingPass({
        gatePassNo: 1,
        variety: 'Atlantic',
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
        variety: 'Atlantic',
        bagSizes: [
          {
            name: 'Ration',
            initialQuantity: 50,
            currentQuantity: 50,
            location: { chamber: '1', floor: '1', row: 'A' },
          },
        ],
      }),
      createIncomingPass({
        _id: 'incoming-3',
        gatePassNo: 3,
        variety: 'Jyoti',
        bagSizes: [
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
    const columns = getFarmerReportColumns(entries, [], false, true);

    const result = buildPdfGroupedLedgerItems({
      rows: sections.incoming,
      columns,
      grouping: ['variety'],
      sizeColumns,
      sectionMode: 'incoming',
    });

    const groupRows = result.items.filter((item) => item.kind === 'group');
    const leafRows = result.items.filter((item) => item.kind === 'leaf');

    expect(groupRows).toHaveLength(2);
    expect(leafRows).toHaveLength(3);

    const atlanticGroup = groupRows.find((row) => row.kind === 'group' && row.label === 'Atlantic');
    expect(atlanticGroup).toMatchObject({
      kind: 'group',
      columnId: 'variety',
      childCount: 2,
      sizes: { Ration: 150 },
      rowBagsTotal: 150,
      depth: 0,
    });
  });

  it('supports nested variety and stock filter grouping', () => {
    const entries = [
      createIncomingPass({
        gatePassNo: 1,
        variety: 'Atlantic',
        stockFilter: 'A',
      }),
      createIncomingPass({
        _id: 'incoming-2',
        gatePassNo: 2,
        variety: 'Atlantic',
        stockFilter: 'B',
      }),
    ];
    const sections = buildFarmerReportSections(entries);
    const columns = getFarmerReportColumns(entries, [], false, true);

    const result = buildPdfGroupedLedgerItems({
      rows: sections.incoming,
      columns,
      grouping: ['variety', 'stockFilter'],
      sizeColumns,
      sectionMode: 'incoming',
    });

    const groupRows = result.items.filter((item) => item.kind === 'group');

    expect(groupRows).toHaveLength(3);
    expect(groupRows[0]).toMatchObject({
      kind: 'group',
      columnId: 'variety',
      label: 'Atlantic',
      depth: 0,
      childCount: 2,
    });
    expect(groupRows[1]).toMatchObject({
      kind: 'group',
      columnId: 'stockFilter',
      depth: 1,
      childCount: 1,
    });
    expect(groupRows[2]).toMatchObject({
      kind: 'group',
      columnId: 'stockFilter',
      depth: 1,
      childCount: 1,
    });
  });

  it('pins opening balance outside grouped outgoing rows', () => {
    const entries = [createIncomingPass({ gatePassNo: 1 }), createOutgoingPass({ gatePassNo: 2 })];
    const sections = buildFarmerReportSections(entries);
    const columns = getFarmerReportColumns(entries, [], false, true);

    const result = buildPdfGroupedLedgerItems({
      rows: sections.outgoing,
      columns,
      grouping: ['variety'],
      sizeColumns,
      sectionMode: 'outgoing',
    });

    expect(result.openingBalanceRows).toHaveLength(1);
    expect(result.openingBalanceRows[0]?.isOpeningBalance).toBe(true);
    expect(result.items.some((item) => item.kind === 'leaf' && item.isOpeningBalance)).toBe(false);
    expect(result.items.some((item) => item.kind === 'group')).toBe(true);
  });

  it('sorts flat rows by gate pass descending when grouping is empty', () => {
    const entries = [
      createIncomingPass({ gatePassNo: 1 }),
      createIncomingPass({
        _id: 'incoming-2',
        gatePassNo: 3,
      }),
      createIncomingPass({
        _id: 'incoming-3',
        gatePassNo: 2,
      }),
    ];
    const sections = buildFarmerReportSections(entries);
    const columns = getFarmerReportColumns(entries, [], false, true);

    const result = buildPdfGroupedLedgerItems({
      rows: sections.incoming,
      columns,
      grouping: [],
      sorting: [{ id: 'gatePassNo', desc: true }],
      sizeColumns,
      sectionMode: 'incoming',
    });

    const gatePasses = result.items
      .filter((item) => item.kind === 'leaf')
      .map((item) => item.gatePass);

    expect(gatePasses).toEqual(['#3', '#2', '#1']);
  });

  it('sorts leaf rows inside groups by gate pass descending', () => {
    const entries = [
      createIncomingPass({ gatePassNo: 1, variety: 'Atlantic' }),
      createIncomingPass({
        _id: 'incoming-2',
        gatePassNo: 3,
        variety: 'Atlantic',
      }),
      createIncomingPass({
        _id: 'incoming-3',
        gatePassNo: 2,
        variety: 'Atlantic',
      }),
    ];
    const sections = buildFarmerReportSections(entries);
    const columns = getFarmerReportColumns(entries, [], false, true);

    const result = buildPdfGroupedLedgerItems({
      rows: sections.incoming,
      columns,
      grouping: ['variety'],
      sorting: [{ id: 'gatePassNo', desc: true }],
      sizeColumns,
      sectionMode: 'incoming',
    });

    const leafGatePasses = result.items
      .filter((item) => item.kind === 'leaf')
      .map((item) => item.gatePass);

    expect(leafGatePasses).toEqual(['#3', '#2', '#1']);
  });

  it('honors sorting via FromTable export path when grouping is active', () => {
    const entries = [
      createIncomingPass({ gatePassNo: 1, variety: 'Atlantic' }),
      createIncomingPass({
        _id: 'incoming-2',
        gatePassNo: 3,
        variety: 'Atlantic',
      }),
      createIncomingPass({
        _id: 'incoming-3',
        gatePassNo: 2,
        variety: 'Atlantic',
      }),
    ];
    const sections = buildFarmerReportSections(entries);
    const columns = getFarmerReportColumns(entries, [], false, true);
    const grouping = ['variety'];
    const sorting = [{ id: 'gatePassNo', desc: true }];

    const table = createTable({
      data: sections.incoming,
      columns,
      state: {
        sorting,
        grouping,
        expanded: true,
      },
      onStateChange: () => undefined,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getGroupedRowModel: getGroupedRowModel(),
      getExpandedRowModel: getExpandedRowModel(),
      sortingFns: farmerReportSortingFns,
      enableSortingRemoval: true,
      sortDescFirst: false,
      groupedColumnMode: 'reorder',
      renderFallbackValue: null,
    });

    const result = buildPdfGroupedLedgerItemsFromTable(
      table,
      sizeColumns,
      sections.incoming,
      'incoming',
    );

    const leafGatePasses = result.items
      .filter((item) => item.kind === 'leaf')
      .map((item) => item.gatePass);

    expect(leafGatePasses).toEqual(['#3', '#2', '#1']);
  });

  it('uses row bag sums for grouped totals instead of running balance', () => {
    const entries = [
      createIncomingPass({
        gatePassNo: 1,
        variety: 'Atlantic',
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
        variety: 'Atlantic',
        bagSizes: [
          {
            name: 'Ration',
            initialQuantity: 40,
            currentQuantity: 40,
            location: { chamber: '1', floor: '1', row: 'A' },
          },
        ],
      }),
    ];
    const sections = buildFarmerReportSections(entries);
    const columns = getFarmerReportColumns(entries, [], false, true);

    const result = buildPdfGroupedLedgerItems({
      rows: sections.incoming,
      columns,
      grouping: ['variety'],
      sizeColumns,
      sectionMode: 'incoming',
    });

    const groupRow = result.items.find((item) => item.kind === 'group');
    const leafRows = result.items.filter((item) => item.kind === 'leaf');

    expect(groupRow).toMatchObject({
      rowBagsTotal: 140,
    });
    expect(leafRows[0]?.rowBags).toBe('100');
    expect(leafRows[1]?.rowBags).toBe('40');
    expect(leafRows[0]?.total).toBe('100');
    expect(leafRows[1]?.total).toBe('140');
  });
});
