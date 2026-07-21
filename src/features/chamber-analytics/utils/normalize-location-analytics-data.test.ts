import { describe, expect, it } from 'vitest';

import type { LocationAnalyticsData } from '../types';
import { buildFarmerLocationChambers } from './build-farmer-location-chambers';
import { rebuildLocationAnalyticsByEffectiveLocation } from './normalize-location-analytics-data';

const farmerOrder = {
  _id: 'order-1',
  gatePassNo: 101,
  date: '2026-01-01T00:00:00.000Z',
  variety: 'Atlantic',
  farmerId: 'farmer-1',
  farmerName: 'Test Farmer',
  bagSizes: [
    {
      name: 'Ration',
      initialQuantity: 100,
      currentQuantity: 80,
      location: { chamber: '1', floor: '1', row: '3' },
      paltaiLocation: [
        { chamber: '1', floor: '1', row: '5' },
        { chamber: '2', floor: '2', row: '4' },
      ],
    },
  ],
};

describe('buildFarmerLocationChambers effective location', () => {
  it('groups bags under the latest paltai chamber and floor', () => {
    const chambers = buildFarmerLocationChambers({
      farmerId: 'farmer-1',
      farmerName: 'Test Farmer',
      accountNumber: 1,
      orderCount: 1,
      orders: [farmerOrder],
    });

    expect(chambers).toHaveLength(1);
    expect(chambers[0]?.chamber).toBe('2');
    expect(chambers[0]?.floors).toEqual([
      expect.objectContaining({ floor: '2', initialTotal: 100, currentTotal: 80 }),
    ]);
  });
});

describe('rebuildLocationAnalyticsByEffectiveLocation', () => {
  it('rebuilds byLocation chambers using latest paltai', () => {
    const data: LocationAnalyticsData = {
      byLocation: {
        chambers: [
          {
            chamber: '1',
            initialTotal: 100,
            currentTotal: 80,
            orderCount: 1,
            floors: [{ floor: '1', initialTotal: 100, currentTotal: 80 }],
            orders: [farmerOrder],
          },
        ],
      },
      byFarmer: [
        {
          farmerId: 'farmer-1',
          farmerName: 'Test Farmer',
          accountNumber: 1,
          orderCount: 1,
          orders: [farmerOrder],
        },
      ],
    };

    const normalized = rebuildLocationAnalyticsByEffectiveLocation(data);

    expect(normalized.byLocation.chambers).toHaveLength(1);
    expect(normalized.byLocation.chambers[0]?.chamber).toBe('2');
    expect(normalized.byLocation.chambers[0]?.floors[0]?.floor).toBe('2');
  });
});
