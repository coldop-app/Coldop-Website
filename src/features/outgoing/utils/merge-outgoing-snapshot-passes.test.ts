import { describe, expect, it } from 'vitest';

import type { IncomingGatePassSnapshot } from '@/features/daybook/types';
import {
  mergeOutgoingSnapshotPasses,
  snapshotToStorageGatePass,
} from '@/features/outgoing/utils/merge-outgoing-snapshot-passes';
import type { StorageGatePass } from '@/features/transfer-stock/types/storage-gate-pass';
import { FARMER_LINK_ID, GATE_PASS_ID } from '@/test/fixtures';

const SNAPSHOT_PASS_ID = '674a1b2c3d4e5f6789012399';
const ACCOUNT_NUMBER = 101;

const snapshot: IncomingGatePassSnapshot = {
  _id: SNAPSHOT_PASS_ID,
  gatePassNo: 25,
  variety: 'Chipsona 1',
  bagSizes: [
    {
      name: 'Ration',
      initialQuantity: 100,
      currentQuantity: 0,
      type: 'Local',
      quantityIssued: 6,
      location: { chamber: '1', floor: '2', row: 'D22-23-24' },
    },
  ],
};

const livePassWithStock: StorageGatePass = {
  _id: GATE_PASS_ID,
  farmerStorageLinkId: FARMER_LINK_ID,
  accountNumber: ACCOUNT_NUMBER,
  gatePassNo: 8,
  date: '2026-02-20T00:00:00.000Z',
  variety: 'K. Jyoti',
  storageCategory: 'Local',
  bagSizes: [
    {
      size: 'Ration',
      currentQuantity: 44,
      initialQuantity: 100,
      bagType: 'Local',
      chamber: '1',
      floor: '2',
      row: 'D22-23-24',
    },
  ],
  remarks: '',
};

describe('snapshotToStorageGatePass', () => {
  it('builds a storage pass with zero current quantity on all snapshot bags', () => {
    const pass = snapshotToStorageGatePass(snapshot, FARMER_LINK_ID, ACCOUNT_NUMBER);

    expect(pass).toMatchObject({
      _id: SNAPSHOT_PASS_ID,
      gatePassNo: 25,
      variety: 'Chipsona 1',
      bagSizes: [
        {
          size: 'Ration',
          currentQuantity: 0,
          initialQuantity: 100,
          chamber: '1',
          floor: '2',
          row: 'D22-23-24',
        },
      ],
    });
  });
});

describe('mergeOutgoingSnapshotPasses', () => {
  it('adds a fully depleted snapshot pass when it is missing from live passes', () => {
    const merged = mergeOutgoingSnapshotPasses([], [snapshot], FARMER_LINK_ID, ACCOUNT_NUMBER);

    expect(merged).toHaveLength(1);
    expect(merged[0]?._id).toBe(SNAPSHOT_PASS_ID);
    expect(merged[0]?.bagSizes[0]?.currentQuantity).toBe(0);
  });

  it('appends a zero-qty snapshot slot when live pass omits that bag', () => {
    const livePassOtherSlot: StorageGatePass = {
      ...livePassWithStock,
      bagSizes: [
        {
          size: 'Ration',
          currentQuantity: 10,
          initialQuantity: 10,
          bagType: 'Local',
          chamber: '1',
          floor: '1',
          row: 'A1',
        },
      ],
    };

    const merged = mergeOutgoingSnapshotPasses(
      [livePassOtherSlot],
      [snapshot],
      FARMER_LINK_ID,
      ACCOUNT_NUMBER,
    );

    expect(merged).toHaveLength(2);
    const syntheticPass = merged.find((pass) => pass._id === SNAPSHOT_PASS_ID);
    expect(syntheticPass?.bagSizes).toHaveLength(1);
    expect(syntheticPass?.bagSizes[0]?.currentQuantity).toBe(0);
  });

  it('preserves live quantity when the snapshot slot still exists in live data', () => {
    const merged = mergeOutgoingSnapshotPasses(
      [livePassWithStock],
      [
        {
          ...snapshot,
          _id: GATE_PASS_ID,
          gatePassNo: 8,
          variety: 'K. Jyoti',
        },
      ],
      FARMER_LINK_ID,
      ACCOUNT_NUMBER,
    );

    expect(merged).toHaveLength(1);
    expect(merged[0]?.bagSizes).toHaveLength(1);
    expect(merged[0]?.bagSizes[0]?.currentQuantity).toBe(44);
  });

  it('appends missing zero-qty slots onto an existing live pass', () => {
    const livePassPartial: StorageGatePass = {
      ...livePassWithStock,
      bagSizes: [
        {
          size: 'Seed',
          currentQuantity: 2,
          initialQuantity: 2,
          bagType: 'Local',
          chamber: '1',
          floor: '2',
          row: 'X1',
        },
      ],
    };

    const merged = mergeOutgoingSnapshotPasses(
      [livePassPartial],
      [{ ...snapshot, _id: GATE_PASS_ID, gatePassNo: 8, variety: 'K. Jyoti' }],
      FARMER_LINK_ID,
      ACCOUNT_NUMBER,
    );

    expect(merged).toHaveLength(1);
    expect(merged[0]?.bagSizes).toHaveLength(2);
    expect(merged[0]?.bagSizes[1]).toMatchObject({
      size: 'Ration',
      currentQuantity: 0,
      initialQuantity: 100,
      chamber: '1',
      floor: '2',
      row: 'D22-23-24',
    });
  });

  it('returns live passes unchanged when snapshots are empty', () => {
    expect(
      mergeOutgoingSnapshotPasses([livePassWithStock], [], FARMER_LINK_ID, ACCOUNT_NUMBER),
    ).toEqual([livePassWithStock]);
  });
});
