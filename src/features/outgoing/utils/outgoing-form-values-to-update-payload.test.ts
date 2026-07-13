import { describe, expect, it } from 'vitest';

import type { OutgoingEditFormValues } from '@/features/outgoing/schemas/outgoing-edit-form-schema';
import type {
  StorageGatePass,
  TransferStockItem,
} from '@/features/transfer-stock/types/storage-gate-pass';
import { allocationKey } from '@/features/transfer-stock/utils/gate-pass-matrix-utils';
import { buildUpdateOutgoingGatePassPayload } from '@/features/outgoing/utils/outgoing-form-values-to-update-payload';
import { FARMER_LINK_ID } from '@/test/fixtures';

const PASS_A = '674a1b2c3d4e5f6789012346';
const allocationKeyA = allocationKey(PASS_A, '25-30', 0);

const baseline: OutgoingEditFormValues = {
  farmerStorageLinkId: FARMER_LINK_ID,
  stockFilter: 'Farmer',
  manualGatePassNumber: 56,
  date: '2026-06-21T10:30:00.000Z',
  from: 'Cold Storage A',
  to: 'Mandi Delhi',
  truckNumber: 'HR-26-AB-1234',
  remarks: 'Original remarks',
  allocations: { [allocationKeyA]: 50 },
};

const passes: StorageGatePass[] = [
  {
    _id: PASS_A,
    farmerStorageLinkId: FARMER_LINK_ID,
    accountNumber: 101,
    gatePassNo: 12,
    date: '2026-06-01T00:00:00.000Z',
    variety: 'Jyoti',
    storageCategory: 'Local',
    bagSizes: [],
    remarks: '',
  },
];

const items: TransferStockItem[] = [
  {
    storageGatePassId: PASS_A,
    gatePassNo: 12,
    bagSize: '25-30',
    bagIndex: 0,
    quantity: 75,
    location: { chamber: 'C1', floor: 'F2', row: 'R3' },
  },
];

describe('buildUpdateOutgoingGatePassPayload', () => {
  it('includes incomingGatePasses when allocations change', () => {
    const current: OutgoingEditFormValues = {
      ...baseline,
      allocations: { [allocationKeyA]: 75 },
    };

    expect(buildUpdateOutgoingGatePassPayload(current, baseline, items, passes)).toEqual({
      incomingGatePasses: [
        {
          incomingGatePassId: PASS_A,
          variety: 'Jyoti',
          allocations: [
            {
              size: '25-30',
              quantityToAllocate: 75,
              location: { chamber: 'C1', floor: 'F2', row: 'R3' },
            },
          ],
        },
      ],
    });
  });

  it('omits incomingGatePasses when allocations are unchanged', () => {
    const current: OutgoingEditFormValues = {
      ...baseline,
      remarks: 'Updated remarks only',
    };

    expect(buildUpdateOutgoingGatePassPayload(current, baseline, items, passes)).toEqual({
      remarks: 'Updated remarks only',
    });
  });

  it('includes stockFilter when it changes', () => {
    const current: OutgoingEditFormValues = {
      ...baseline,
      stockFilter: 'Owned',
    };

    expect(buildUpdateOutgoingGatePassPayload(current, baseline, items, passes)).toEqual({
      stockFilter: 'Owned',
    });
  });
});
