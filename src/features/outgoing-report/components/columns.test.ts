import { describe, expect, it } from 'vitest';

import type { OutgoingGatePassReportRecord } from '@/features/outgoing-report/api/types';
import { getOutgoingReportColumns } from '@/features/outgoing-report/components/columns';

const sampleRow: OutgoingGatePassReportRecord = {
  _id: '674a1b2c3d4e5f6789012345',
  gatePassNo: 24,
  date: '2026-06-21T00:00:00.000Z',
  stockFilter: 'Owned',
  orderDetails: [{ size: '50 kg', quantityAvailable: 10, quantityIssued: 5 }],
  totalBags: 5,
  farmerStorageLinkId: {
    name: 'Farmer',
    accountNumber: 101,
    address: 'Addr',
    mobileNumber: '9999999999',
  },
};

function columnKey(column: { id?: string; accessorKey?: string }) {
  return column.id ?? column.accessorKey;
}

describe('getOutgoingReportColumns', () => {
  it('includes stock filter column when preference is enabled', () => {
    const columns = getOutgoingReportColumns([sampleRow], 'issued', true);
    expect(columns.some((column) => columnKey(column) === 'stockFilter')).toBe(true);
  });

  it('omits stock filter column when preference is disabled', () => {
    const columns = getOutgoingReportColumns([sampleRow], 'issued', false);
    expect(columns.some((column) => columnKey(column) === 'stockFilter')).toBe(false);
  });
});
