import type { StorageGatePass } from '@/features/transfer-stock/types/storage-gate-pass';

/** Raw API-shaped records from backend samples */
const RAW_MOCK_STORAGE_GATE_PASSES = [
  {
    _id: '69e7653af5ed0b5cdaa05ca0',
    farmerStorageLinkId: {
      _id: '69bce60e45da3ec4db013239',
      farmerId: {
        _id: '69bce60e45da3ec4db013237',
        name: 'SAHYOG HORTICULTURE',
        address: 'UP,INDIA',
        mobileNumber: '9814418806',
      },
      linkedById: { _id: '69994f49de81addb0a11da6b', name: 'Deepanshu' },
      accountNumber: 10,
    },
    gatePassNo: 404,
    manualGatePassNumber: 120,
    date: '2026-03-04T00:00:00.000Z',
    variety: 'K. Jyoti',
    storageCategory: 'RENTAL',
    bagSizes: [
      {
        size: 'Ration',
        currentQuantity: 40,
        initialQuantity: 40,
        bagType: 'LENO',
        chamber: '4',
        floor: '1',
        row: 'D',
      },
    ],
    remarks: 'JYOTI-G3 RENTAL',
  },
  {
    _id: '69e0afd5f5ed0b5cdaa0526e',
    farmerStorageLinkId: {
      _id: '69e0afb1f5ed0b5cdaa05264',
      farmerId: {
        _id: '69e0afb1f5ed0b5cdaa05262',
        name: 'SANDEEP YADAV',
        address: 'PUNJAB,INDIA',
        mobileNumber: '9814418820',
      },
      linkedById: { _id: '69994f49de81addb0a11da6b', name: 'Deepanshu' },
      accountNumber: 111,
    },
    gatePassNo: 403,
    manualGatePassNumber: 403,
    date: '2026-04-11T00:00:00.000Z',
    variety: 'K. Jyoti',
    storageCategory: 'RENTAL',
    bagSizes: [
      {
        size: 'Ration',
        currentQuantity: 2,
        initialQuantity: 2,
        bagType: 'LENO',
        chamber: '1',
        floor: '1',
        row: 'A',
      },
    ],
    remarks: 'JYOTI-RENTED.',
  },
  {
    _id: '69da20e9f5ed0b5cdaa03889',
    farmerStorageLinkId: {
      _id: '69bd250845da3ec4db013bd8',
      farmerId: {
        _id: '69bd250845da3ec4db013bd6',
        name: 'RAM KISHAN SETHIA',
        address: 'PUNJAB,INDIA',
        mobileNumber: '9814418807',
      },
      linkedById: { _id: '69994f49de81addb0a11da6b', name: 'Deepanshu' },
      accountNumber: 15,
    },
    gatePassNo: 402,
    manualGatePassNumber: 402,
    date: '2026-04-11T00:00:00.000Z',
    variety: 'K. Pukhraj',
    storageCategory: 'RENTAL',
    bagSizes: [
      {
        size: 'Ration',
        currentQuantity: 82,
        initialQuantity: 82,
        bagType: 'LENO',
        chamber: '5',
        floor: '1',
        row: 'C',
      },
      {
        size: 'Number-12',
        currentQuantity: 86,
        initialQuantity: 86,
        bagType: 'LENO',
        chamber: '5',
        floor: '1',
        row: 'C&B',
      },
    ],
    remarks: 'PUKHRA-RENTED.',
  },
  {
    _id: '69da207ef5ed0b5cdaa03872',
    farmerStorageLinkId: {
      _id: '69bd250845da3ec4db013bd8',
      farmerId: {
        _id: '69bd250845da3ec4db013bd6',
        name: 'RAM KISHAN SETHIA',
        address: 'PUNJAB,INDIA',
        mobileNumber: '9814418807',
      },
      linkedById: { _id: '69994f49de81addb0a11da6b', name: 'Deepanshu' },
      accountNumber: 15,
    },
    gatePassNo: 401,
    manualGatePassNumber: 400,
    date: '2026-04-10T00:00:00.000Z',
    variety: 'K. Pukhraj',
    storageCategory: 'RENTAL',
    bagSizes: [
      {
        size: 'Ration',
        currentQuantity: 44,
        initialQuantity: 44,
        bagType: 'LENO',
        chamber: '5',
        floor: '1',
        row: 'C',
      },
      {
        size: 'Goli',
        currentQuantity: 136,
        initialQuantity: 136,
        bagType: 'LENO',
        chamber: '5',
        floor: '1',
        row: 'C',
      },
    ],
    remarks: 'PUKHRAJ-RENTED.',
  },
  {
    _id: '69da2037f5ed0b5cdaa0385b',
    farmerStorageLinkId: {
      _id: '69bd250845da3ec4db013bd8',
      farmerId: {
        _id: '69bd250845da3ec4db013bd6',
        name: 'RAM KISHAN SETHIA',
        address: 'PUNJAB,INDIA',
        mobileNumber: '9814418807',
      },
      linkedById: { _id: '69994f49de81addb0a11da6b', name: 'Deepanshu' },
      accountNumber: 15,
    },
    gatePassNo: 400,
    manualGatePassNumber: 400,
    date: '2026-04-10T00:00:00.000Z',
    variety: 'K. Pukhraj',
    storageCategory: 'RENTAL',
    bagSizes: [
      {
        size: 'Goli',
        currentQuantity: 75,
        initialQuantity: 75,
        bagType: 'LENO',
        chamber: '5',
        floor: '1',
        row: 'C',
      },
      {
        size: 'Number-12',
        currentQuantity: 75,
        initialQuantity: 75,
        bagType: 'LENO',
        chamber: '5',
        floor: '1',
        row: 'C',
      },
    ],
    remarks: 'PUKHRAJ-RENTED.',
  },
  {
    _id: '69da1fcff5ed0b5cdaa0383d',
    farmerStorageLinkId: {
      _id: '69bd250845da3ec4db013bd8',
      farmerId: {
        _id: '69bd250845da3ec4db013bd6',
        name: 'RAM KISHAN SETHIA',
        address: 'PUNJAB,INDIA',
        mobileNumber: '9814418807',
      },
      linkedById: { _id: '69994f49de81addb0a11da6b', name: 'Deepanshu' },
      accountNumber: 15,
    },
    gatePassNo: 399,
    manualGatePassNumber: 399,
    date: '2026-04-10T00:00:00.000Z',
    variety: 'K. Pukhraj',
    storageCategory: 'RENTAL',
    bagSizes: [
      {
        size: 'Goli',
        currentQuantity: 80,
        initialQuantity: 80,
        bagType: 'LENO',
        chamber: '5',
        floor: '2',
        row: 'B',
      },
      {
        size: 'Number-12',
        currentQuantity: 100,
        initialQuantity: 100,
        bagType: 'LENO',
        chamber: '5',
        floor: '1',
        row: 'C',
      },
    ],
    remarks: 'PUKHRAJ-RENTED.',
  },
] as const;

function normalizePass(raw: (typeof RAW_MOCK_STORAGE_GATE_PASSES)[number]): StorageGatePass {
  const link = raw.farmerStorageLinkId as { _id: string; accountNumber: number };
  return {
    _id: raw._id,
    farmerStorageLinkId: link._id,
    accountNumber: link.accountNumber,
    gatePassNo: raw.gatePassNo,
    manualGatePassNumber: raw.manualGatePassNumber,
    date: raw.date,
    variety: raw.variety,
    storageCategory: raw.storageCategory,
    bagSizes: [...raw.bagSizes],
    remarks: raw.remarks,
  };
}

export const MOCK_STORAGE_GATE_PASSES: StorageGatePass[] =
  RAW_MOCK_STORAGE_GATE_PASSES.map(normalizePass);

/** Demo farmer link id with multiple passes in mock data */
export const DEMO_FARMER_STORAGE_LINK_ID = '69bd250845da3ec4db013bd8';

export function getMockStorageGatePassesForFarmer(farmerStorageLinkId: string): StorageGatePass[] {
  if (!farmerStorageLinkId.trim()) return [];
  return MOCK_STORAGE_GATE_PASSES.filter(
    (pass) => pass.farmerStorageLinkId === farmerStorageLinkId,
  );
}
