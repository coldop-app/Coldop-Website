import type { ComboboxOption } from '@/components/searchable-option-combobox';
import type {
  CommodityPreference,
  Preferences,
  StockFilterPreference,
} from '@/features/auth/types';
import { createDefaultIncomingQuantities } from '@/features/incoming/schemas/incoming-quantities-schema';

export function toComboboxOptions(values: string[]): ComboboxOption[] {
  return values.map((value) => ({ id: value, label: value }));
}

export function getDefaultCommodityName(commodities: CommodityPreference[]): string {
  return commodities.length === 1 ? commodities[0].name : '';
}

export function getCommodityByName(
  commodities: CommodityPreference[],
  name: string,
): CommodityPreference | undefined {
  return commodities.find((commodity) => commodity.name === name);
}

export function findCommodityByVariety(
  commodities: CommodityPreference[],
  variety: string,
): CommodityPreference | undefined {
  return commodities.find((commodity) => commodity.varieties.includes(variety));
}

export function shouldShowCommoditySelect(commodities: CommodityPreference[]): boolean {
  return commodities.length > 1;
}

export function shouldShowStockFilter(stockFilter: StockFilterPreference | undefined): boolean {
  return Boolean(stockFilter?.enabled && stockFilter.options.length > 0);
}

export function shouldShowCustomMarka(customMarka: boolean | undefined): boolean {
  return customMarka === true;
}

export function getBagSizesForCommodity(commodity: CommodityPreference | undefined): string[] {
  return commodity?.sizes ?? [];
}

export function sortByPreferenceOrder<T extends { name: string }>(
  items: T[],
  sizeOrder: string[],
): T[] {
  if (sizeOrder.length === 0) return items;

  const orderIndex = new Map(sizeOrder.map((size, index) => [size, index]));

  return [...items].sort((a, b) => {
    const aIndex = orderIndex.get(a.name);
    const bIndex = orderIndex.get(b.name);

    if (aIndex === undefined && bIndex === undefined) return 0;
    if (aIndex === undefined) return 1;
    if (bIndex === undefined) return -1;
    return aIndex - bIndex;
  });
}

export function sortSizeNamesByPreferenceOrder(sizes: string[], sizeOrder: string[]): string[] {
  if (sizeOrder.length === 0) return [...sizes].sort();

  return sortByPreferenceOrder(
    sizes.map((name) => ({ name })),
    sizeOrder,
  ).map((item) => item.name);
}

export function getMergedBagSizeOrder(commodities: CommodityPreference[]): string[] {
  const seen = new Set<string>();
  const order: string[] = [];

  for (const commodity of commodities) {
    for (const size of commodity.sizes) {
      if (!seen.has(size)) {
        seen.add(size);
        order.push(size);
      }
    }
  }

  return order;
}

export function getPreferredBagSizeOrderForTransfer(
  commodities: CommodityPreference[],
  varietyFilter: string,
): string[] {
  const variety = varietyFilter.trim();
  if (variety) {
    const varietyOrder = getBagSizeOrderForVariety(commodities, variety);
    if (varietyOrder.length > 0) return varietyOrder;
  }

  if (commodities.length === 1) return commodities[0]?.sizes ?? [];

  return getMergedBagSizeOrder(commodities);
}

export function getBagSizeOrderForVariety(
  commodities: CommodityPreference[],
  variety: string,
): string[] {
  const commodity = findCommodityByVariety(commodities, variety);
  if (commodity) return commodity.sizes;

  if (commodities.length === 1) return commodities[0].sizes;

  return [];
}

export function createQuantitiesForSizes(sizes: string[]) {
  return createDefaultIncomingQuantities(sizes);
}

export function buildIncomingFormSchemaConfig(
  preferences: Preferences | null,
  selectedCommodityName: string,
) {
  const commodities = preferences?.commodities ?? [];
  const selectedCommodity = getCommodityByName(commodities, selectedCommodityName);
  const bagSizes = getBagSizesForCommodity(selectedCommodity);

  return {
    requireCommodity: commodities.length > 0,
    requireStockFilter: shouldShowStockFilter(preferences?.stockFilter),
    requireCustomMarka: shouldShowCustomMarka(preferences?.customMarka),
    bagSizes,
  };
}
