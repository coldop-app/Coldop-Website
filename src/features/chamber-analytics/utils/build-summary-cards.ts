import type { LucideIcon } from 'lucide-react';
import { Building2, MapPin, Package, Warehouse } from 'lucide-react';

import { formatQuantity } from '@/features/daybook/utils/format';

import type { LocationAnalyticsChamber, LocationAnalyticsQuantityTab } from '../types';
import { NO_CHAMBER } from '../types';
import { getChamberQuantity } from './get-location-quantity';

export type ChamberSummaryCard = {
  label: string;
  value: string;
  subtext: string;
  highlight?: boolean;
};

export type ChamberSummaryCards = {
  totalStock: ChamberSummaryCard;
  activeChambers: ChamberSummaryCard;
  topChamber: ChamberSummaryCard;
  unassignedStock: ChamberSummaryCard;
};

export type ChamberSummaryCardConfig = {
  key: keyof ChamberSummaryCards;
  icon: LucideIcon;
};

export const CHAMBER_SUMMARY_CARD_CONFIG: ChamberSummaryCardConfig[] = [
  { key: 'totalStock', icon: Package },
  { key: 'activeChambers', icon: Building2 },
  { key: 'topChamber', icon: Warehouse },
  { key: 'unassignedStock', icon: MapPin },
];

function findUnassignedChamber(
  chambers: LocationAnalyticsChamber[],
): LocationAnalyticsChamber | undefined {
  return chambers.find((chamber) => chamber.chamber === NO_CHAMBER);
}

export function buildChamberSummaryCards(
  chambers: LocationAnalyticsChamber[],
  tab: LocationAnalyticsQuantityTab,
): ChamberSummaryCards {
  const totalStock = chambers.reduce((sum, chamber) => sum + getChamberQuantity(chamber, tab), 0);

  const activeChambers = chambers.filter(
    (chamber) => chamber.chamber !== NO_CHAMBER && getChamberQuantity(chamber, tab) > 0,
  );

  const topChamber = [...chambers]
    .filter((chamber) => chamber.chamber !== NO_CHAMBER)
    .sort((a, b) => getChamberQuantity(b, tab) - getChamberQuantity(a, tab))[0];

  const unassigned = findUnassignedChamber(chambers);
  const unassignedQty = unassigned ? getChamberQuantity(unassigned, tab) : 0;

  return {
    totalStock: {
      label: tab === 'current' ? 'Current stock' : 'Initial stock',
      value: formatQuantity(totalStock),
      subtext: 'Across all locations',
      highlight: totalStock > 0,
    },
    activeChambers: {
      label: 'Active chambers',
      value: String(activeChambers.length),
      subtext:
        activeChambers.length === 1
          ? '1 chamber with stock'
          : `${activeChambers.length} chambers with stock`,
    },
    topChamber: {
      label: 'Top chamber',
      value: topChamber?.chamber ?? '—',
      subtext: topChamber
        ? `${formatQuantity(getChamberQuantity(topChamber, tab))} bags`
        : 'No chamber data',
      highlight: Boolean(topChamber),
    },
    unassignedStock: {
      label: 'Unassigned location',
      value: formatQuantity(unassignedQty),
      subtext: 'Stock without chamber',
      highlight: unassignedQty > 0,
    },
  };
}
