import { describe, expect, it } from 'vitest';

import type { OutgoingFormValues } from '@/features/outgoing/schemas/outgoing-form-schema';
import type {
  StorageGatePass,
  TransferStockItem,
} from '@/features/transfer-stock/types/storage-gate-pass';
import { buildCreateOutgoingGatePassPayload } from '@/features/outgoing/utils/outgoing-form-values-to-create-payload';

const FARMER_ID = '674a1b2c3d4e5f6789012345';
const PASS_A = '674a1b2c3d4e5f6789012346';
const PASS_B = '674a1b2c3d4e5f6789012347';

const baseValues: OutgoingFormValues = {
  farmerStorageLinkId: FARMER_ID,
  date: '2026-06-21T10:30:00.000Z',
  stockFilter: '',
  manualGatePassNumber: 55,
  from: 'Cold Storage A',
  to: 'Mandi Delhi',
  truckNumber: 'hr-26-ab-1234',
  remarks: 'Morning dispatch',
  allocations: {},
};

const passes: StorageGatePass[] = [
  {
    _id: PASS_A,
    farmerStorageLinkId: FARMER_ID,
    accountNumber: 101,
    gatePassNo: 12,
    date: '2026-06-01T00:00:00.000Z',
    variety: 'Jyoti',
    storageCategory: 'Local',
    bagSizes: [],
    remarks: '',
  },
  {
    _id: PASS_B,
    farmerStorageLinkId: FARMER_ID,
    accountNumber: 101,
    gatePassNo: 13,
    date: '2026-06-02T00:00:00.000Z',
    variety: 'Kufri',
    storageCategory: 'Local',
    bagSizes: [],
    remarks: '',
  },
];

describe('buildCreateOutgoingGatePassPayload', () => {
  it('groups multiple allocations on the same pass into one incomingGatePasses entry', () => {
    const items: TransferStockItem[] = [
      {
        storageGatePassId: PASS_A,
        gatePassNo: 12,
        bagSize: '25-30',
        bagIndex: 0,
        quantity: 50,
        location: { chamber: 'C1', floor: 'F2', row: 'R3' },
      },
      {
        storageGatePassId: PASS_A,
        gatePassNo: 12,
        bagSize: '30-35',
        bagIndex: 1,
        quantity: 25,
        location: { chamber: 'C2', floor: 'F1', row: 'R2' },
      },
    ];

    const payload = buildCreateOutgoingGatePassPayload(
      baseValues,
      items,
      passes,
      101,
      'outgoing-gp-001',
    );

    expect(payload.incomingGatePasses).toHaveLength(1);
    expect(payload.incomingGatePasses[0]).toEqual({
      incomingGatePassId: PASS_A,
      variety: 'Jyoti',
      allocations: [
        {
          size: '25-30',
          quantityToAllocate: 50,
          location: { chamber: 'C1', floor: 'F2', row: 'R3' },
        },
        {
          size: '30-35',
          quantityToAllocate: 25,
          location: { chamber: 'C2', floor: 'F1', row: 'R2' },
        },
      ],
    });
  });

  it('creates separate incomingGatePasses entries per pass with correct variety', () => {
    const items: TransferStockItem[] = [
      {
        storageGatePassId: PASS_A,
        gatePassNo: 12,
        bagSize: '25-30',
        bagIndex: 0,
        quantity: 30,
        location: { chamber: 'C1', floor: 'F1', row: 'R1' },
      },
      {
        storageGatePassId: PASS_B,
        gatePassNo: 13,
        bagSize: 'Number-8',
        bagIndex: 0,
        quantity: 10,
        location: { chamber: 'C3', floor: 'F1', row: 'R4' },
      },
    ];

    const payload = buildCreateOutgoingGatePassPayload(baseValues, items, passes, 101);

    expect(payload.incomingGatePasses).toHaveLength(2);
    expect(payload.incomingGatePasses[0]?.variety).toBe('Jyoti');
    expect(payload.incomingGatePasses[1]?.variety).toBe('Kufri');
  });

  it('creates separate incomingGatePasses entries per variety (Chipsona + Kufri Jyoti)', () => {
    const mixedPasses: StorageGatePass[] = [
      {
        _id: PASS_A,
        farmerStorageLinkId: FARMER_ID,
        accountNumber: 101,
        gatePassNo: 12,
        date: '2026-06-01T00:00:00.000Z',
        variety: 'Kufri Jyoti',
        storageCategory: 'Local',
        bagSizes: [],
        remarks: '',
      },
      {
        _id: PASS_B,
        farmerStorageLinkId: FARMER_ID,
        accountNumber: 101,
        gatePassNo: 13,
        date: '2026-06-02T00:00:00.000Z',
        variety: 'Chipsona',
        storageCategory: 'Local',
        bagSizes: [],
        remarks: '',
      },
    ];

    const items: TransferStockItem[] = [
      {
        storageGatePassId: PASS_A,
        gatePassNo: 12,
        bagSize: '50 kg',
        bagIndex: 0,
        quantity: 20,
        location: { chamber: 'A', floor: '1', row: 'R1' },
      },
      {
        storageGatePassId: PASS_B,
        gatePassNo: 13,
        bagSize: '50 kg',
        bagIndex: 0,
        quantity: 15,
        location: { chamber: 'B', floor: '2', row: 'R3' },
      },
    ];

    const payload = buildCreateOutgoingGatePassPayload(baseValues, items, mixedPasses, 101);

    expect(payload.incomingGatePasses).toHaveLength(2);
    expect(payload.incomingGatePasses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          incomingGatePassId: PASS_A,
          variety: 'Kufri Jyoti',
        }),
        expect.objectContaining({
          incomingGatePassId: PASS_B,
          variety: 'Chipsona',
        }),
      ]),
    );
    expect(payload).not.toHaveProperty('variety');
  });

  it('maps top-level fields and omits empty optional strings', () => {
    const payload = buildCreateOutgoingGatePassPayload(
      {
        ...baseValues,
        manualGatePassNumber: undefined,
        from: '',
        to: '  ',
        truckNumber: '',
        remarks: '  ',
      },
      [
        {
          storageGatePassId: PASS_A,
          gatePassNo: 12,
          bagSize: '25-30',
          bagIndex: 0,
          quantity: 10,
          location: { chamber: 'C1', floor: 'F1', row: 'R1' },
        },
      ],
      passes,
      101,
    );

    expect(payload).toEqual({
      farmerStorageLinkId: FARMER_ID,
      gatePassNo: 101,
      date: '2026-06-21T10:30:00.000Z',
      incomingGatePasses: [
        {
          incomingGatePassId: PASS_A,
          variety: 'Jyoti',
          allocations: [
            {
              size: '25-30',
              quantityToAllocate: 10,
              location: { chamber: 'C1', floor: 'F1', row: 'R1' },
            },
          ],
        },
      ],
    });
  });

  it('uppercases truck number and includes idempotencyKey when provided', () => {
    const payload = buildCreateOutgoingGatePassPayload(
      baseValues,
      [
        {
          storageGatePassId: PASS_A,
          gatePassNo: 12,
          bagSize: '25-30',
          bagIndex: 0,
          quantity: 10,
          location: { chamber: 'C1', floor: 'F1', row: 'R1' },
        },
      ],
      passes,
      101,
      'outgoing-gp-2026-06-21-001',
    );

    expect(payload.truckNumber).toBe('HR-26-AB-1234');
    expect(payload.idempotencyKey).toBe('outgoing-gp-2026-06-21-001');
    expect(payload.manualParchiNumber).toBe(55);
    expect(payload.remarks).toBe('Morning dispatch');
  });

  it('includes stockFilter when set on form values', () => {
    const payload = buildCreateOutgoingGatePassPayload(
      { ...baseValues, stockFilter: 'Owned' },
      [
        {
          storageGatePassId: PASS_A,
          gatePassNo: 12,
          bagSize: '25-30',
          bagIndex: 0,
          quantity: 10,
          location: { chamber: 'C1', floor: 'F1', row: 'R1' },
        },
      ],
      passes,
      101,
    );

    expect(payload.stockFilter).toBe('Owned');
  });
});
