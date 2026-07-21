import type { DaybookLocation, IncomingBagSize } from '@/features/daybook/types';
import {
  formatCompactLocation,
  hasDaybookLocation,
} from '@/features/daybook/utils/format';

export type PaltaiLocationInput = DaybookLocation | DaybookLocation[] | null | undefined;

export function normalizePaltaiLocations(value: PaltaiLocationInput): DaybookLocation[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter((location) => hasDaybookLocation(location));
  }
  return hasDaybookLocation(value) ? [value] : [];
}

export function getLatestPaltaiLocation(
  paltaiLocation?: DaybookLocation[] | null,
): DaybookLocation | undefined {
  const normalized = normalizePaltaiLocations(paltaiLocation);
  return normalized.at(-1);
}

export type BagWithLocation = {
  location: DaybookLocation;
  paltaiLocation?: DaybookLocation[] | null;
};

export function getEffectiveBagLocation(bag: BagWithLocation): DaybookLocation {
  return getLatestPaltaiLocation(bag.paltaiLocation) ?? bag.location;
}

export function formatPaltaiLocationsList(
  paltaiLocation?: DaybookLocation[] | null,
  options: { compact?: boolean; separator?: string } = {},
): string {
  const { compact = true, separator = ' → ' } = options;
  const locations = normalizePaltaiLocations(paltaiLocation);
  if (locations.length === 0) return '';

  const format = compact ? formatCompactLocation : (location: DaybookLocation) =>
      `Chamber ${location.chamber} / Floor ${location.floor} / Row ${location.row}`;

  return locations.map(format).join(separator);
}

export function formatPaltaiLocationsSubtext(
  paltaiLocation?: DaybookLocation[] | null,
): string | null {
  const formatted = formatPaltaiLocationsList(paltaiLocation);
  return formatted ? `Paltai: (${formatted})` : null;
}

export function paltaiLocationKeys(paltaiLocation?: DaybookLocation[] | null): string[] {
  return normalizePaltaiLocations(paltaiLocation).map(
    (location) => `${location.chamber}\u001f${location.floor}\u001f${location.row}`,
  );
}

export function bagMatchesLocation(
  bag: Pick<IncomingBagSize, 'location' | 'paltaiLocation'>,
  target: DaybookLocation,
): boolean {
  const targetKey = `${target.chamber}\u001f${target.floor}\u001f${target.row}`;
  const primaryKey = `${bag.location.chamber}\u001f${bag.location.floor}\u001f${bag.location.row}`;
  if (primaryKey === targetKey) return true;

  return paltaiLocationKeys(bag.paltaiLocation).some((key) => key === targetKey);
}

export function mapFormPaltaiLocationsToApi(
  rows: Array<{ chamber: string; floor: string; row: string }>,
): DaybookLocation[] {
  return rows
    .map((row) => ({
      chamber: row.chamber.trim(),
      floor: row.floor.trim(),
      row: row.row.trim(),
    }))
    .filter(
      (location) =>
        location.chamber !== '' && location.floor !== '' && location.row !== '',
    );
}

export function normalizeBagPaltaiLocations<T extends BagWithLocation>(bag: T): T {
  return {
    ...bag,
    paltaiLocation: normalizePaltaiLocations(bag.paltaiLocation),
  };
}
