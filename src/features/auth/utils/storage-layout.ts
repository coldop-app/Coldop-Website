import type { StorageLayoutChamber } from '../types';

export function hasStorageLayout(layout: StorageLayoutChamber[] | null | undefined): boolean {
  return (layout?.length ?? 0) > 0;
}

export function getStorageLayoutChambers(
  layout: StorageLayoutChamber[] | null | undefined,
): string[] {
  if (!layout?.length) return [];
  return layout.map((chamber) => chamber.name);
}

export function getStorageLayoutFloors(
  layout: StorageLayoutChamber[] | null | undefined,
  chamberName: string,
): string[] {
  if (!layout?.length || !chamberName) return [];

  const chamber = layout.find((item) => item.name === chamberName);
  if (!chamber) return [];

  return chamber.floors.map((floor) => floor.name);
}

/** Sum of floor capacities for a chamber in the storage layout. */
export function getStorageLayoutChamberCapacity(
  layout: StorageLayoutChamber[] | null | undefined,
  chamberName: string,
): number | null {
  if (!layout?.length || !chamberName) return null;

  const chamber = layout.find((item) => item.name === chamberName);
  if (!chamber) return null;

  return chamber.floors.reduce((sum, floor) => sum + floor.capacity, 0);
}

/** Capacity for a single floor within a chamber in the storage layout. */
export function getStorageLayoutFloorCapacity(
  layout: StorageLayoutChamber[] | null | undefined,
  chamberName: string,
  floorName: string,
): number | null {
  if (!layout?.length || !chamberName || !floorName) return null;

  const chamber = layout.find((item) => item.name === chamberName);
  const floor = chamber?.floors.find((item) => item.name === floorName);
  if (!floor) return null;

  return floor.capacity;
}

/**
 * Utilization percent: current qty vs configured capacity when available,
 * otherwise fall back to current / initial (legacy retained ratio).
 */
export function formatUtilizationPercent(current: number, capacityOrInitial: number): number {
  if (capacityOrInitial <= 0) return 0;
  return (current / capacityOrInitial) * 100;
}

/** Ensure a legacy/free-text value still appears in Select options. */
export function withLegacyOption(options: string[], value: string): string[] {
  const trimmed = value.trim();
  if (!trimmed || options.includes(trimmed)) return options;
  return [...options, trimmed];
}
