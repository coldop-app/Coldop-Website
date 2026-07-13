import { describe, expect, it } from 'vitest';
import type { DaybookEntry, IncomingDaybookEntry } from '@/features/daybook/types';
import { buildFarmerReportSections } from '@/features/people-report/utils/build-farmer-report-sections';
import { generateFarmerStockLedgerPdf } from '@/features/people-report/utils/generate-farmer-stock-ledger-pdf';

const farmerLink = {
  _id: 'link-1',
  name: 'Tirlok Singh',
  accountNumber: 42,
  address: 'Village Raipur',
  mobileNumber: '9876543210',
};

function createIncomingPass(): IncomingDaybookEntry {
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
    ],
  };
}

describe('generateFarmerStockLedgerPdf smoke', () => {
  it('produces a non-empty PDF blob', async () => {
    const entries: DaybookEntry[] = [createIncomingPass()];
    const sections = buildFarmerReportSections(entries);
    const blob = await generateFarmerStockLedgerPdf({
      entries,
      sections,
      summaries: {
        totalIncomingBags: 100,
        totalOutgoingBags: 0,
        totalInternallyTransferredIncomingBags: 0,
        totalInternallyTransferredOutgoingBags: 0,
      },
      commodities: [{ name: 'Potato', varieties: ['Atlantic'], sizes: ['Ration'] }],
      search: {
        tab: 'incoming',
        name: 'Tirlok Singh',
        address: 'Village Raipur',
        mobileNumber: '9876543210',
        accountNumber: 42,
      },
      coldStorageName: 'Test Cold Storage',
      coldStorageAddress: 'Somewhere',
    });
    expect(blob.size).toBeGreaterThan(1000);
    expect(blob.type).toMatch(/pdf/);
  }, 60000);
});
