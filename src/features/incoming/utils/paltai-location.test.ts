import { describe, expect, it } from 'vitest';

import type { DaybookLocation } from '@/features/daybook/types';
import {
  bagMatchesLocation,
  getEffectiveBagLocation,
  getLatestPaltaiLocation,
  mapFormPaltaiLocationsToApi,
  normalizePaltaiLocations,
} from '@/features/incoming/utils/paltai-location';

describe('normalizePaltaiLocations', () => {
  it('returns empty array for undefined or empty input', () => {
    expect(normalizePaltaiLocations(undefined)).toEqual([]);
    expect(normalizePaltaiLocations([])).toEqual([]);
  });

  it('wraps a legacy single location object in an array', () => {
    const legacy: DaybookLocation = { chamber: '1', floor: '1', row: '5' };

    expect(normalizePaltaiLocations(legacy)).toEqual([legacy]);
  });

  it('preserves array order and filters blank entries', () => {
    const locations: DaybookLocation[] = [
      { chamber: '1', floor: '1', row: '5' },
      { chamber: '', floor: '', row: '' },
      { chamber: '2', floor: '2', row: '4' },
    ];

    expect(normalizePaltaiLocations(locations)).toEqual([
      { chamber: '1', floor: '1', row: '5' },
      { chamber: '2', floor: '2', row: '4' },
    ]);
  });
});

describe('getLatestPaltaiLocation', () => {
  it('returns the last non-empty paltai entry', () => {
    const locations = [
      { chamber: '1', floor: '1', row: '5' },
      { chamber: '2', floor: '2', row: '4' },
    ];

    expect(getLatestPaltaiLocation(locations)).toEqual(locations[1]);
  });
});

describe('getEffectiveBagLocation', () => {
  it('uses latest paltai when present, otherwise primary location', () => {
    const bag = {
      location: { chamber: '1', floor: '1', row: '3' },
      paltaiLocation: [
        { chamber: '1', floor: '1', row: '5' },
        { chamber: '2', floor: '2', row: '4' },
      ],
    };

    expect(getEffectiveBagLocation(bag)).toEqual({ chamber: '2', floor: '2', row: '4' });

    expect(
      getEffectiveBagLocation({
        location: { chamber: '1', floor: '1', row: '3' },
      }),
    ).toEqual({ chamber: '1', floor: '1', row: '3' });
  });
});

describe('bagMatchesLocation', () => {
  it('matches primary or any paltai location', () => {
    const bag = {
      name: 'Ration',
      location: { chamber: '1', floor: '1', row: '3' },
      paltaiLocation: [
        { chamber: '1', floor: '1', row: '5' },
        { chamber: '2', floor: '2', row: '4' },
      ],
    };

    expect(bagMatchesLocation(bag, { chamber: '1', floor: '1', row: '3' })).toBe(true);
    expect(bagMatchesLocation(bag, { chamber: '2', floor: '2', row: '4' })).toBe(true);
    expect(bagMatchesLocation(bag, { chamber: '9', floor: '9', row: '9' })).toBe(false);
  });
});

describe('mapFormPaltaiLocationsToApi', () => {
  it('maps complete form rows and drops incomplete entries', () => {
    expect(
      mapFormPaltaiLocationsToApi([
        { chamber: '1', floor: '1', row: '5' },
        { chamber: '2', floor: '', row: '4' },
        { chamber: '3', floor: '3', row: '3' },
      ]),
    ).toEqual([
      { chamber: '1', floor: '1', row: '5' },
      { chamber: '3', floor: '3', row: '3' },
    ]);
  });
});
