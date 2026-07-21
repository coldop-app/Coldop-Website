import type { DaybookLocation } from '@/features/daybook/types';
import { getEffectiveBagLocation } from '@/features/incoming/utils/paltai-location';

import type { LocationAnalyticsBagSize } from '../types';

export function getEffectiveAnalyticsBagLocation(
  bag: LocationAnalyticsBagSize,
): DaybookLocation {
  return getEffectiveBagLocation(bag);
}

export function withEffectiveAnalyticsLocation<T extends LocationAnalyticsBagSize>(
  bag: T,
): T & { effectiveLocation: DaybookLocation } {
  return {
    ...bag,
    effectiveLocation: getEffectiveAnalyticsBagLocation(bag),
  };
}
