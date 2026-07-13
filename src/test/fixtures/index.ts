import type { Preferences } from '@/features/auth/types';
import type { IncomingDaybookEntry, OutgoingDaybookEntry } from '@/features/daybook/types';
import type { ComboboxOption } from '@/components/searchable-option-combobox';
import type { FarmerStorageLink } from '@/features/people/types';

export const USER_ID = '662f9a8b7c6d5e4f32109876';
export const GATE_PASS_ID = '674c8a1b2d3e4f5678901234';
export const OUTGOING_GATE_PASS_ID = '674c8a1b2d3e4f5678901250';
export const FARMER_LINK_ID = '664a1b2c3d4e5f6789012345';

export function makeFarmerStorageLink(
  overrides: Partial<FarmerStorageLink> = {},
): FarmerStorageLink {
  return {
    _id: FARMER_LINK_ID,
    accountNumber: 101,
    name: 'Rajesh Kumar',
    address: 'Village Rampur, Karnal',
    mobileNumber: '9876543210',
    isActive: true,
    costPerBag: 110,
    ...overrides,
  };
}

export function makePreferences(overrides: Partial<Preferences> = {}): Preferences {
  return {
    _id: '662f9a8b7c6d5e4f32109877',
    commodities: [
      {
        name: 'Potato',
        varieties: ['Kufri Jyoti'],
        sizes: ['50kg', 'Ration'],
      },
    ],
    reportFormat: 'standard',
    showFinances: true,
    labourCost: 0,
    customFields: {},
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function makeIncomingDaybookEntry(
  overrides: Partial<IncomingDaybookEntry> = {},
): IncomingDaybookEntry {
  return {
    _id: GATE_PASS_ID,
    gatePassNo: 12,
    manualParchiNumber: 'P-4521',
    date: '2026-06-20T08:30:00.000Z',
    createdAt: '2026-06-20T08:35:00.000Z',
    updatedAt: '2026-06-20T10:30:00.000Z',
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
    rentEntryVoucherId: '674c8a1b2d3e4f5678901299',
    farmerStorageLinkId: {
      _id: FARMER_LINK_ID,
      name: 'Rajesh Kumar',
      accountNumber: 101,
      address: 'Village Rampur, Karnal',
      mobileNumber: '9876543210',
    },
    createdBy: {
      _id: USER_ID,
      name: 'Store Admin',
    },
    ...overrides,
  };
}

export function makeOutgoingDaybookEntry(
  overrides: Partial<OutgoingDaybookEntry> = {},
): OutgoingDaybookEntry {
  return {
    _id: OUTGOING_GATE_PASS_ID,
    gatePassNo: 24,
    manualParchiNumber: 56,
    truckNumber: 'hr-26-ab-1234',
    from: 'Cold Storage A',
    to: 'Mandi Delhi',
    date: '2026-06-21T10:30:00.000Z',
    createdAt: '2026-06-21T10:35:00.000Z',
    updatedAt: '2026-06-21T11:00:00.000Z',
    type: 'DELIVERY',
    variety: 'Kufri Jyoti',
    orderDetails: [
      {
        size: '50kg',
        quantityAvailable: 120,
        quantityIssued: 50,
        location: { chamber: 'A', floor: '1', row: '3' },
      },
    ],
    incomingGatePassSnapshots: [
      {
        _id: GATE_PASS_ID,
        gatePassNo: 12,
        variety: 'Kufri Jyoti',
        bagSizes: [
          {
            name: '50kg',
            initialQuantity: 120,
            currentQuantity: 70,
            type: 'Local',
            quantityIssued: 50,
            location: { chamber: 'A', floor: '1', row: '3' },
          },
        ],
      },
    ],
    remarks: 'Morning dispatch',
    isNull: false,
    farmerStorageLinkId: {
      _id: FARMER_LINK_ID,
      name: 'Rajesh Kumar',
      accountNumber: 101,
      address: 'Village Rampur, Karnal',
      mobileNumber: '9876543210',
    },
    createdBy: {
      _id: USER_ID,
      name: 'Store Admin',
    },
    ...overrides,
  };
}

export function makeLedgerOptions(): ComboboxOption[] {
  return [
    { id: 'ledger-cash-id', label: 'Cash A/c' },
    { id: 'ledger-bank-id', label: 'Bank A/c' },
  ];
}
