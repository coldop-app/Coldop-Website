import { describe, expect, it } from 'vitest';

import type { TransferStockFormValues } from '@/features/transfer-stock/schemas/transfer-stock-form-schema';
import type { TransferStockItem } from '@/features/transfer-stock/types/storage-gate-pass';
import { buildCreateTransferStockPayload } from '@/features/transfer-stock/utils/transfer-form-values-to-create-payload';

const FROM_ID = '674a1b2c3d4e5f6789012345';
const TO_ID = '674a1b2c3d4e5f6789012346';
const PASS_ID = '674a1b2c3d4e5f6789012347';

const values: TransferStockFormValues = {
  fromFarmerStorageLinkId: FROM_ID,
  toFarmerStorageLinkId: TO_ID,
  date: '2025-06-21T00:00:00.000Z',
  customMarka: '',
  remarks: '',
  allocations: {},
};

const items: TransferStockItem[] = [
  {
    storageGatePassId: PASS_ID,
    gatePassNo: 5,
    bagSize: '50 kg',
    bagIndex: 0,
    quantity: 10,
    location: { chamber: 'A', floor: '1', row: '2' },
  },
];

describe('buildCreateTransferStockPayload', () => {
  it('maps storageGatePassId to incomingGatePassId', () => {
    const payload = buildCreateTransferStockPayload(values, items);

    expect(payload).toEqual({
      fromFarmerStorageLinkId: FROM_ID,
      toFarmerStorageLinkId: TO_ID,
      date: '2025-06-21T00:00:00.000Z',
      items: [
        {
          incomingGatePassId: PASS_ID,
          bagSize: '50 kg',
          quantity: 10,
          location: { chamber: 'A', floor: '1', row: '2' },
        },
      ],
    });
  });

  it('includes remarks only when non-empty', () => {
    const withRemarks = buildCreateTransferStockPayload(
      { ...values, remarks: '  Transfer note  ' },
      items,
    );
    expect(withRemarks.remarks).toBe('Transfer note');

    const withoutRemarks = buildCreateTransferStockPayload({ ...values, remarks: '   ' }, items);
    expect(withoutRemarks.remarks).toBeUndefined();
  });

  it('includes customMarka only when non-empty', () => {
    const withCustomMarka = buildCreateTransferStockPayload(
      { ...values, customMarka: '  ABC-123  ' },
      items,
    );
    expect(withCustomMarka.customMarka).toBe('ABC-123');

    const withoutCustomMarka = buildCreateTransferStockPayload(
      { ...values, customMarka: '   ' },
      items,
    );
    expect(withoutCustomMarka.customMarka).toBeUndefined();
  });

  it('does not include truckNumber', () => {
    const payload = buildCreateTransferStockPayload(values, items);
    expect(payload).not.toHaveProperty('truckNumber');
  });

  it('includes amount and isBuyPotato when potato options are provided', () => {
    const payload = buildCreateTransferStockPayload(values, items, {
      potatoAction: 'buy',
      costPerBag: 25,
    });

    expect(payload.amount).toBe(250);
    expect(payload.isBuyPotato).toBe(true);
    expect(payload.isSellPotato).toBeUndefined();
  });

  it('includes amount and isSellPotato when potato options are provided', () => {
    const payload = buildCreateTransferStockPayload(values, items, {
      potatoAction: 'sell',
      costPerBag: 30,
    });

    expect(payload.amount).toBe(300);
    expect(payload.isSellPotato).toBe(true);
    expect(payload.isBuyPotato).toBeUndefined();
  });
});
