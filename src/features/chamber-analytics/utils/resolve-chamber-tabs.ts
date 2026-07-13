import type { LocationAnalyticsChamber } from '../types';

export type ChamberTabItem = {
  value: string;
  label: string;
  orderCount: number;
};

export function resolveChamberTabs(
  chambers: LocationAnalyticsChamber[],
  selectedChamber: string | undefined,
): {
  tabs: ChamberTabItem[];
  activeChamber: string | null;
} {
  if (chambers.length === 0) {
    return { tabs: [], activeChamber: null };
  }

  const tabs = chambers.map((chamber) => ({
    value: chamber.chamber,
    label: chamber.chamber,
    orderCount: chamber.orderCount,
  }));

  const activeChamber =
    selectedChamber && chambers.some((c) => c.chamber === selectedChamber)
      ? selectedChamber
      : (chambers[0]?.chamber ?? null);

  return { tabs, activeChamber };
}

export function findChamberByName(
  chambers: LocationAnalyticsChamber[],
  chamberName: string | null,
): LocationAnalyticsChamber | null {
  if (!chamberName) return null;
  return chambers.find((chamber) => chamber.chamber === chamberName) ?? null;
}
