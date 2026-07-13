import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { Layers, MapPin, RefreshCw, Warehouse } from 'lucide-react';

import { useLocationAnalytics } from '../api/use-location-analytics';
import type { LocationAnalyticsQuantityTab } from '../types';
import { buildChamberSummaryCards } from '../utils/build-summary-cards';
import { filterChamberOrders } from '../utils/filter-chamber-orders';
import { findChamberByName, resolveChamberTabs } from '../utils/resolve-chamber-tabs';
import {
  ChamberAnalyticsSummaryCards,
  ChamberAnalyticsSummaryCardsSkeleton,
} from './chamber-analytics-summary-cards';
import { ChamberFloorUtilizationMap } from './chamber-floor-utilization-map';
import { ChamberOrdersTable } from './chamber-orders-table';

type ChamberAnalyticsLocationTabProps = {
  tab: LocationAnalyticsQuantityTab;
  chamber: string | undefined;
  floor: string;
  enabled: boolean;
  onChamberChange: (chamber: string) => void;
  onFloorChange: (floor: string) => void;
};

function LocationTabSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <ChamberAnalyticsSummaryCardsSkeleton />
      <Skeleton className="h-[420px] w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

export function ChamberAnalyticsLocationTab({
  tab,
  chamber,
  floor,
  enabled,
  onChamberChange,
  onFloorChange,
}: ChamberAnalyticsLocationTabProps) {
  const analytics = useLocationAnalytics({ enabled });

  if (analytics.isLoading) {
    return <LocationTabSkeleton />;
  }

  if (analytics.isError) {
    return (
      <Empty className="border-border bg-card rounded-xl border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <RefreshCw />
          </EmptyMedia>
          <EmptyTitle>Could not load location analytics</EmptyTitle>
          <EmptyDescription>
            {analytics.error instanceof Error
              ? analytics.error.message
              : 'Something went wrong while fetching location data.'}
          </EmptyDescription>
        </EmptyHeader>
        <Button variant="outline" size="sm" onClick={() => void analytics.refetch()}>
          <RefreshCw className="mr-2 size-4" />
          Try again
        </Button>
      </Empty>
    );
  }

  const chambers = analytics.response?.data?.byLocation.chambers ?? [];

  if (chambers.length === 0) {
    return (
      <Empty className="border-border bg-card rounded-xl border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Warehouse />
          </EmptyMedia>
          <EmptyTitle>No location data</EmptyTitle>
          <EmptyDescription>There is no stock assigned to chambers or floors yet.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const cards = buildChamberSummaryCards(chambers, tab);
  const { activeChamber } = resolveChamberTabs(chambers, chamber);
  const selectedChamber = findChamberByName(chambers, activeChamber);
  const activeFloor = floor && floor !== 'all' ? floor : null;
  const filteredOrders =
    selectedChamber && activeFloor
      ? filterChamberOrders(selectedChamber.orders, activeFloor, tab)
      : [];
  const chamberLabel = activeChamber ?? '';
  const floorLabel = activeFloor ?? '';

  return (
    <div className="flex flex-col gap-6">
      <ChamberAnalyticsSummaryCards cards={cards} />

      {activeChamber ? (
        <ChamberFloorUtilizationMap
          chambers={chambers}
          activeChamber={activeChamber}
          floor={floor}
          tab={tab}
          onChamberChange={onChamberChange}
          onFloorChange={onFloorChange}
        />
      ) : (
        <Empty className="border-border bg-card rounded-xl border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MapPin />
            </EmptyMedia>
            <EmptyTitle>Select a chamber</EmptyTitle>
            <EmptyDescription>
              Choose a chamber to view floor utilization and gate passes.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {activeFloor && chamberLabel ? (
        <ChamberOrdersTable
          orders={filteredOrders}
          chamberLabel={chamberLabel}
          floorLabel={floorLabel}
        />
      ) : selectedChamber ? (
        <Empty className="border-border bg-card rounded-xl border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Layers />
            </EmptyMedia>
            <EmptyTitle>Select a floor</EmptyTitle>
            <EmptyDescription>
              Click a floor card above to view gate passes stored in this chamber.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : null}
    </div>
  );
}
