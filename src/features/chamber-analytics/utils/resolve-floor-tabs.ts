import type { LocationAnalyticsChamber } from '../types';

export type FloorTabItem = {
  value: string;
  label: string;
};

export function resolveFloorTabs(
  chamber: LocationAnalyticsChamber | null,
  selectedFloor: string,
): {
  tabs: FloorTabItem[];
  activeFloor: string | null;
} {
  if (!chamber) {
    return { tabs: [], activeFloor: null };
  }

  const tabs = chamber.floors.map((floor) => ({
    value: floor.floor,
    label: floor.floor,
  }));

  const hasValidSelection =
    Boolean(selectedFloor) &&
    selectedFloor !== 'all' &&
    chamber.floors.some((floor) => floor.floor === selectedFloor);

  return {
    tabs,
    activeFloor: hasValidSelection ? selectedFloor : null,
  };
}
