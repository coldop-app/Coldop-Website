import { describe, expect, it } from 'vitest';

import { outgoingDaybookEntryToAllocations } from '@/features/outgoing/utils/outgoing-daybook-entry-to-allocations';
import type { StorageGatePass } from '@/features/transfer-stock/types/storage-gate-pass';
import { allocationKey } from '@/features/transfer-stock/utils/gate-pass-matrix-utils';
import { FARMER_LINK_ID, GATE_PASS_ID, makeOutgoingDaybookEntry } from '@/test/fixtures';

const passes: StorageGatePass[] = [
  {
    _id: GATE_PASS_ID,
    farmerStorageLinkId: FARMER_LINK_ID,
    accountNumber: 101,
    gatePassNo: 12,
    date: '2026-06-01T00:00:00.000Z',
    variety: 'Kufri Jyoti',
    storageCategory: 'Local',
    bagSizes: [
      {
        size: '50kg',
        currentQuantity: 70,
        initialQuantity: 120,
        bagType: 'Local',
        chamber: 'A',
        floor: '1',
        row: '3',
      },
    ],
    remarks: '',
  },
];

describe('outgoingDaybookEntryToAllocations', () => {
  it('maps order lines to allocation keys using live passes', () => {
    const entry = makeOutgoingDaybookEntry();
    const result = outgoingDaybookEntryToAllocations(entry, passes);
    const key = allocationKey(GATE_PASS_ID, '50kg', 0);

    expect(result.allocations).toEqual({ [key]: 50 });
    expect(result.baselineAllocations).toEqual({ [key]: 50 });
  });

  it('resolves baseline allocations from snapshots when live passes are missing', () => {
    const entry = makeOutgoingDaybookEntry();
    const result = outgoingDaybookEntryToAllocations(entry, []);
    const key = allocationKey(GATE_PASS_ID, '50kg', 0);

    expect(result.allocations).toEqual({ [key]: 50 });
    expect(result.baselineAllocations).toEqual({ [key]: 50 });
  });

  it('skips order lines when snapshot does not match size and location', () => {
    const entry = makeOutgoingDaybookEntry({
      orderDetails: [
        {
          size: '25kg',
          quantityAvailable: 50,
          quantityIssued: 10,
          location: { chamber: 'B', floor: '2', row: '1' },
        },
      ],
    });

    const result = outgoingDaybookEntryToAllocations(entry, passes);

    expect(result.allocations).toEqual({});
  });
});
