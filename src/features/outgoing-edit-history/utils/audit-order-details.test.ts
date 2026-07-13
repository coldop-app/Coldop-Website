import { describe, expect, it } from 'vitest';

import type { IncomingGatePassSnapshot } from '@/features/daybook/types';
import type { OutgoingGatePassAuditOrderDetail } from '@/features/outgoing-edit-history/types';
import {
  buildAlignedOrderDetailRows,
  findSnapshotForOrderLine,
  mergeOrderDetailKeys,
  orderDetailLineKey,
  resolveRefGatePassNo,
} from '@/features/outgoing-edit-history/utils/audit-order-details';
import { getOutgoingGatePassAuditChangedFields } from '@/features/outgoing-edit-history/utils/format-audit-field-value';

function makeLine(
  overrides: Partial<OutgoingGatePassAuditOrderDetail> & {
    size: string;
    quantityIssued: number;
  },
): OutgoingGatePassAuditOrderDetail {
  return {
    quantityAvailable: 100,
    location: { chamber: 'A', floor: '1', row: '2' },
    ...overrides,
  };
}

function makeSnapshot(
  overrides: Partial<IncomingGatePassSnapshot> & {
    gatePassNo: number;
    size: string;
  },
): IncomingGatePassSnapshot {
  const { size, ...rest } = overrides;

  return {
    _id: 'snap-1',
    variety: 'Jyoti',
    bagSizes: [
      {
        name: size,
        currentQuantity: 50,
        initialQuantity: 100,
        type: 'RECEIPT',
        quantityIssued: 10,
        location: { chamber: 'A', floor: '1', row: '2' },
      },
    ],
    ...rest,
  };
}

describe('orderDetailLineKey', () => {
  it('uses size and location as identity', () => {
    const line = makeLine({ size: 'Jumbo', quantityIssued: 5 });

    expect(orderDetailLineKey(line)).toBe('Jumbo\u001fA\u001f1\u001f2');
  });
});

describe('mergeOrderDetailKeys', () => {
  it('preserves before order and appends after-only lines', () => {
    const before = [
      makeLine({ size: 'A', quantityIssued: 1 }),
      makeLine({ size: 'B', quantityIssued: 2 }),
    ];
    const after = [
      makeLine({ size: 'B', quantityIssued: 2 }),
      makeLine({ size: 'C', quantityIssued: 3 }),
    ];

    expect(mergeOrderDetailKeys(before, after).map((key) => key.split('\u001f')[0])).toEqual([
      'A',
      'B',
      'C',
    ]);
  });

  it('aligns same keys when after order differs', () => {
    const before = [
      makeLine({ size: 'A', quantityIssued: 1 }),
      makeLine({ size: 'B', quantityIssued: 2 }),
    ];
    const after = [
      makeLine({ size: 'B', quantityIssued: 4 }),
      makeLine({ size: 'A', quantityIssued: 1 }),
    ];

    const aligned = buildAlignedOrderDetailRows(before, after);

    expect(aligned).toHaveLength(2);
    expect(aligned[0]?.beforeLine?.size).toBe('A');
    expect(aligned[0]?.afterLine?.size).toBe('A');
    expect(aligned[1]?.beforeLine?.size).toBe('B');
    expect(aligned[1]?.afterLine?.quantityIssued).toBe(4);
  });
});

describe('findSnapshotForOrderLine', () => {
  it('matches snapshot by size and location', () => {
    const line = makeLine({ size: 'Jumbo', quantityIssued: 10 });
    const snapshots = [makeSnapshot({ gatePassNo: 42, size: 'Jumbo' })];

    expect(findSnapshotForOrderLine(snapshots, line)?.gatePassNo).toBe(42);
  });

  it('returns null ref when no snapshot matches', () => {
    const line = makeLine({ size: 'Jumbo', quantityIssued: 10 });

    expect(resolveRefGatePassNo([], line)).toBeNull();
  });
});

describe('getOutgoingGatePassAuditChangedFields', () => {
  it('excludes incomingGatePassSnapshots from changed fields', () => {
    const before = {
      incomingGatePassSnapshots: [makeSnapshot({ gatePassNo: 1, size: 'Jumbo' })],
      orderDetails: [makeLine({ size: 'Jumbo', quantityIssued: 5 })],
    };
    const after = {
      incomingGatePassSnapshots: [
        makeSnapshot({
          gatePassNo: 1,
          size: 'Jumbo',
          bagSizes: [
            {
              name: 'Jumbo',
              currentQuantity: 40,
              initialQuantity: 100,
              type: 'RECEIPT',
              quantityIssued: 10,
              location: { chamber: 'A', floor: '1', row: '2' },
            },
          ],
        }),
      ],
      orderDetails: [makeLine({ size: 'Jumbo', quantityIssued: 5 })],
    };

    const changedFields = getOutgoingGatePassAuditChangedFields(before, after);

    expect(changedFields).not.toContain('incomingGatePassSnapshots');
    expect(changedFields).toContain('orderDetails');
  });

  it('includes orderDetails when only order lines change', () => {
    const before = {
      orderDetails: [makeLine({ size: 'Jumbo', quantityIssued: 5 })],
    };
    const after = {
      orderDetails: [makeLine({ size: 'Jumbo', quantityIssued: 8 })],
    };

    expect(getOutgoingGatePassAuditChangedFields(before, after)).toContain('orderDetails');
  });
});
