import { describe, expect, it } from 'vitest';

import type { IncomingGatePassRecord } from '@/features/incoming/types/api';
import {
  incomingGatePassToStorageGatePass,
  incomingGatePassesToStorageGatePasses,
} from '@/features/transfer-stock/utils/incoming-gate-pass-to-storage-gate-pass';
import { passMatchesGatePassSearch } from '@/features/transfer-stock/utils/gate-pass-matrix-utils';

const FARMER_LINK_ID = '664a1b2c3d4e5f6789012345';

function makeRecord(overrides: Partial<IncomingGatePassRecord> = {}): IncomingGatePassRecord {
  return {
    _id: '674c8a1b2d3e4f5678901234',
    farmerStorageLinkId: {
      name: 'Rajesh Kumar',
      accountNumber: 101,
      address: 'Village Rampur, Karnal',
      mobileNumber: '9876543210',
    },
    createdBy: {
      _id: '662f9a8b7c6d5e4f3210987',
      name: 'Store Admin',
    },
    gatePassNo: 12,
    date: '2026-06-20T08:30:00.000Z',
    type: 'RECEIPT',
    variety: 'Kufri Jyoti',
    truckNumber: 'HR-26-5678',
    bagSizes: [
      {
        name: '50kg',
        initialQuantity: 120,
        currentQuantity: 120,
        location: {
          chamber: 'A',
          floor: '1',
          row: '3',
        },
      },
    ],
    status: 'OPEN',
    remarks: 'Morning receipt',
    manualParchiNumber: 'P-4521',
    createdAt: '2026-06-20T08:35:00.000Z',
    updatedAt: '2026-06-20T10:30:00.000Z',
    ...overrides,
  };
}

describe('incomingGatePassToStorageGatePass', () => {
  it('flattens nested bag location and maps API field names', () => {
    const mapped = incomingGatePassToStorageGatePass(makeRecord(), FARMER_LINK_ID);

    expect(mapped).toMatchObject({
      _id: '674c8a1b2d3e4f5678901234',
      farmerStorageLinkId: FARMER_LINK_ID,
      accountNumber: 101,
      gatePassNo: 12,
      manualParchiNumber: 'P-4521',
      variety: 'Kufri Jyoti',
      storageCategory: 'RECEIPT',
      remarks: 'Morning receipt',
      bagSizes: [
        {
          size: '50kg',
          currentQuantity: 120,
          initialQuantity: 120,
          bagType: '',
          chamber: 'A',
          floor: '1',
          row: '3',
        },
      ],
    });
  });

  it('parses numeric manual parchi into manualGatePassNumber', () => {
    const mapped = incomingGatePassToStorageGatePass(
      makeRecord({ manualParchiNumber: '4521' }),
      FARMER_LINK_ID,
    );

    expect(mapped.manualGatePassNumber).toBe(4521);
  });

  it('preserves stockFilter when present on the record', () => {
    const mapped = incomingGatePassToStorageGatePass(
      makeRecord({ stockFilter: 'Owned' }),
      FARMER_LINK_ID,
    );

    expect(mapped.stockFilter).toBe('Owned');
  });
});

describe('incomingGatePassesToStorageGatePasses', () => {
  it('filters out passes with no remaining stock', () => {
    const records = [
      makeRecord({ _id: 'with-stock' }),
      makeRecord({
        _id: 'empty-stock',
        bagSizes: [
          {
            name: '50kg',
            initialQuantity: 100,
            currentQuantity: 0,
            location: { chamber: 'A', floor: '1', row: '2' },
          },
        ],
      }),
    ];

    const passes = incomingGatePassesToStorageGatePasses(records, FARMER_LINK_ID);

    expect(passes).toHaveLength(1);
    expect(passes[0]?._id).toBe('with-stock');
  });
});

describe('passMatchesGatePassSearch', () => {
  it('matches manual parchi number text', () => {
    const pass = incomingGatePassToStorageGatePass(makeRecord(), FARMER_LINK_ID);

    expect(passMatchesGatePassSearch(pass, 'p-4521')).toBe(true);
    expect(passMatchesGatePassSearch(pass, '12')).toBe(true);
    expect(passMatchesGatePassSearch(pass, '999')).toBe(false);
  });

  it('matches marka using manual parchi when available', () => {
    const pass = incomingGatePassToStorageGatePass(makeRecord(), FARMER_LINK_ID);

    expect(
      passMatchesGatePassSearch(pass, 'p-4521/120', {
        customMarka: false,
        markaType: 'GatePass',
      }),
    ).toBe(true);
    expect(
      passMatchesGatePassSearch(pass, '120', {
        customMarka: false,
        markaType: 'GatePass',
      }),
    ).toBe(true);
  });

  it('falls back to gate pass number in marka when manual parchi is missing', () => {
    const pass = incomingGatePassToStorageGatePass(
      makeRecord({ manualParchiNumber: undefined }),
      FARMER_LINK_ID,
    );

    expect(
      passMatchesGatePassSearch(pass, '12/120', {
        customMarka: false,
        markaType: 'GatePass',
      }),
    ).toBe(true);
  });

  it('matches custom marka when custom marka preference is enabled', () => {
    const pass = incomingGatePassToStorageGatePass(
      makeRecord({ customMarka: 'TS-42' }),
      FARMER_LINK_ID,
    );

    expect(
      passMatchesGatePassSearch(pass, 'ts-42', {
        customMarka: true,
        markaType: 'GatePass',
      }),
    ).toBe(true);
  });

  it('falls back to computed marka when custom marka preference is on but pass has none', () => {
    const pass = incomingGatePassToStorageGatePass(
      makeRecord({ customMarka: undefined, manualParchiNumber: undefined }),
      FARMER_LINK_ID,
    );

    expect(
      passMatchesGatePassSearch(pass, '12/120', {
        customMarka: true,
        markaType: 'GatePass',
      }),
    ).toBe(true);
  });
});
