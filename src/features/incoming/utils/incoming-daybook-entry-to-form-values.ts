import type { CommodityPreference } from '@/features/auth/types';
import type { IncomingDaybookEntry, IncomingBagSize } from '@/features/daybook/types';
import type { IncomingQuantityRow } from '@/features/incoming/schemas/incoming-form-schema';
import { resolveBagSizes } from '@/features/incoming/schemas/incoming-quantities-schema';
import { normalizePaltaiLocations } from '@/features/incoming/utils/paltai-location';
import type { IncomingFormValues } from '@/features/incoming/types';
import {
  findCommodityByVariety,
  getBagSizeOrderForVariety,
  sortByPreferenceOrder,
} from '@/features/incoming/utils/incoming-preferences';
import { resolveFarmerStorageLinkId } from '@/features/daybook/utils/resolve-farmer-storage-link-id';
import type { FarmerStorageLink } from '@/features/people/types';
import { DEFAULT_BAG_TYPE } from '@/lib/constants';

function parseManualGatePassNumber(value: string | number | undefined): number | undefined {
  if (value === undefined || value === '') return undefined;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function normalizeToIsoDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  return date.toISOString();
}

function bagToQuantityRow(bag: IncomingBagSize, isExtra: boolean): IncomingQuantityRow {
  return {
    id: crypto.randomUUID(),
    size: bag.name,
    isExtra,
    qty: bag.initialQuantity > 0 ? bag.initialQuantity : undefined,
    bagType: DEFAULT_BAG_TYPE,
    chamber: bag.location.chamber,
    floor: bag.location.floor,
    row: bag.location.row,
    paltaiLocations: normalizePaltaiLocations(bag.paltaiLocation).map((location) => ({
      id: crypto.randomUUID(),
      chamber: location.chamber,
      floor: location.floor,
      row: location.row,
    })),
  };
}

function emptyQuantityRow(size: string): IncomingQuantityRow {
  return {
    id: crypto.randomUUID(),
    size,
    isExtra: false,
    qty: undefined,
    bagType: DEFAULT_BAG_TYPE,
    chamber: '',
    floor: '',
    row: '',
    paltaiLocations: [],
  };
}

function mapBagSizesToQuantities(
  entry: IncomingDaybookEntry,
  commodities: CommodityPreference[],
): IncomingQuantityRow[] {
  const templateSizes = getBagSizeOrderForVariety(commodities, entry.variety);
  const resolvedTemplateSizes = resolveBagSizes(templateSizes);
  const sortedEntryBags = sortByPreferenceOrder(entry.bagSizes ?? [], templateSizes);

  const bagsByName = new Map<string, IncomingBagSize[]>();
  for (const bag of sortedEntryBags) {
    const existing = bagsByName.get(bag.name) ?? [];
    existing.push(bag);
    bagsByName.set(bag.name, existing);
  }

  const rows: IncomingQuantityRow[] = [];

  for (const size of resolvedTemplateSizes) {
    const bags = bagsByName.get(size) ?? [];
    bagsByName.delete(size);

    if (bags.length === 0) {
      rows.push(emptyQuantityRow(size));
      continue;
    }

    rows.push(bagToQuantityRow(bags[0], false));
    for (let index = 1; index < bags.length; index++) {
      rows.push(bagToQuantityRow(bags[index], true));
    }
  }

  for (const bags of bagsByName.values()) {
    for (const bag of bags) {
      rows.push(bagToQuantityRow(bag, true));
    }
  }

  return rows;
}

type IncomingDaybookEntryToFormValuesOptions = {
  entry: IncomingDaybookEntry;
  commodities: CommodityPreference[];
  farmerStorageLinks: FarmerStorageLink[];
  userId: string;
};

export function incomingDaybookEntryToFormValues({
  entry,
  commodities,
  farmerStorageLinks,
  userId,
}: IncomingDaybookEntryToFormValuesOptions): IncomingFormValues {
  const commodity = findCommodityByVariety(commodities, entry.variety);
  const commodityName = commodity?.name ?? '';

  return {
    gatePassNo: entry.gatePassNo,
    manualGatePassNumber: parseManualGatePassNumber(entry.manualParchiNumber),
    farmerIncomingLinkId: resolveFarmerStorageLinkId(entry.farmerStorageLinkId, farmerStorageLinks),
    createdBy: entry.createdBy?._id ?? userId,
    commodity: commodityName,
    variety: entry.variety,
    stockFilter: entry.stockFilter ?? '',
    customMarka: entry.customMarka ?? '',
    date: normalizeToIsoDateTime(entry.date),
    truckNumber: (entry.truckNumber ?? '').toUpperCase(),
    quantities: mapBagSizesToQuantities(entry, commodities),
    remarks: entry.remarks ?? '',
  };
}
