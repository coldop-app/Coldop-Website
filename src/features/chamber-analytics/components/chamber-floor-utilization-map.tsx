import { useEffect } from 'react';
import { CheckCircle2, Layers, Warehouse, type LucideIcon } from 'lucide-react';

import { useColdStorageStore } from '@/features/auth/store/use-cold-storage-store';
import { formatQuantity } from '@/features/daybook/utils/format';
import { cn } from '@/lib/utils';

import type { LocationAnalyticsChamber, LocationAnalyticsQuantityTab } from '../types';
import { buildChamberUtilizationRows } from '../utils/build-chamber-utilization-rows';
import { mergeChamberFloors } from '../utils/merge-chamber-floors';
import {
  formatUtilizationDisplay,
  utilizationBand,
  utilizationBandBarClass,
  utilizationBandDotClass,
  type UtilizationBand,
} from '../utils/utilization-band';
import { isSentinelLabel } from './chamber-analytics-summary-cards';

type ChamberFloorUtilizationMapProps = {
  chambers: LocationAnalyticsChamber[];
  activeChamber: string;
  floor: string;
  tab: LocationAnalyticsQuantityTab;
  onChamberChange: (chamber: string) => void;
  onFloorChange: (floor: string) => void;
  /** When false, only chamber/floor cards are shown (no inspector panels). */
  showInspectors?: boolean;
};

function UtilizationLegend() {
  return (
    <span className="text-foreground flex gap-4 text-xs font-medium">
      <span className="flex items-center gap-1.5">
        <span className={cn('size-2.5 rounded-full', utilizationBandDotClass('low'))} />
        Low
      </span>
      <span className="flex items-center gap-1.5">
        <span className={cn('size-2.5 rounded-full', utilizationBandDotClass('medium'))} />
        Medium
      </span>
      <span className="flex items-center gap-1.5">
        <span className={cn('size-2.5 rounded-full', utilizationBandDotClass('high'))} />
        High
      </span>
    </span>
  );
}

function UtilizationMiniCard({
  label,
  utilization,
  quantity,
  selected,
  italic,
  onClick,
}: {
  label: string;
  utilization: number;
  quantity: number;
  selected: boolean;
  italic?: boolean;
  onClick: () => void;
}) {
  const band: UtilizationBand = utilizationBand(utilization);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'flex h-20 flex-col justify-between rounded-lg border p-2.5 text-left transition-all',
        selected
          ? 'border-primary bg-primary/5 ring-primary/30 ring-2'
          : 'bg-background hover:border-primary/40 hover:bg-muted/50',
      )}
    >
      <span
        className={cn(
          'text-muted-foreground text-xs leading-none font-semibold uppercase',
          italic && 'italic',
        )}
      >
        {label}
      </span>
      <div className="space-y-1.5">
        <span className="flex items-end justify-between gap-2">
          <span className="font-heading text-foreground text-sm leading-none font-semibold tabular-nums">
            {formatUtilizationDisplay(utilization)}
          </span>
          <span className="text-muted-foreground text-xs leading-none tabular-nums">
            {formatQuantity(quantity)}
          </span>
        </span>
        <div className="bg-muted h-1 overflow-hidden rounded-full">
          <div
            className={cn('h-full rounded-full', utilizationBandBarClass(band))}
            style={{ width: `${Math.min(utilization, 100)}%` }}
          />
        </div>
      </div>
    </button>
  );
}

type InspectorStat = {
  label: string;
  value: string;
  emphasize?: boolean;
};

function UtilizationInspector({
  title,
  subtitle,
  icon: Icon,
  utilization,
  utilizedLabel,
  stats,
}: {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  utilization: number;
  utilizedLabel: string;
  stats: InspectorStat[];
}) {
  const band = utilizationBand(utilization);

  return (
    <div className="border-border bg-background rounded-xl border p-5 sm:p-6">
      <div className="border-border flex items-center justify-between border-b pb-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
            <Icon className="size-4" />
          </div>
          <div className="min-w-0">
            <h3 className="font-heading text-foreground text-sm leading-none font-semibold">
              {title}
            </h3>
            <p className="text-muted-foreground mt-1 truncate text-xs uppercase">{subtitle}</p>
          </div>
        </div>
        <span className="border-primary/20 bg-primary/10 text-primary flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold">
          <CheckCircle2 className="size-3" /> Live
        </span>
      </div>

      <div className="space-y-5 pt-5 text-sm">
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Utilization
            </p>
            <p className="font-heading text-foreground text-base font-bold tabular-nums">
              {formatUtilizationDisplay(utilization)}
            </p>
          </div>
          <div className="bg-muted mt-2 h-2.5 overflow-hidden rounded-full">
            <div
              className={cn(
                'h-full rounded-full transition-[width] duration-300',
                utilizationBandBarClass(band),
              )}
              style={{ width: `${Math.min(utilization, 100)}%` }}
            />
          </div>
          <p className="text-muted-foreground mt-1.5 text-xs tabular-nums">{utilizedLabel}</p>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                {stat.label}
              </p>
              <p
                className={cn(
                  'mt-1 tabular-nums',
                  stat.emphasize ? 'text-primary font-semibold' : 'text-foreground font-medium',
                )}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ChamberFloorUtilizationMap({
  chambers,
  activeChamber,
  floor,
  tab,
  onChamberChange,
  onFloorChange,
  showInspectors = true,
}: ChamberFloorUtilizationMapProps) {
  const storageLayout = useColdStorageStore((state) => state.coldStorage?.storageLayout);

  const chamberRows = buildChamberUtilizationRows({
    chambers,
    storageLayout,
    tab,
  });

  const selectedChamber = chambers.find((item) => item.chamber === activeChamber) ?? chambers[0];

  const selectedChamberRow =
    chamberRows.find((row) => row.chamber === selectedChamber?.chamber) ?? chamberRows[0] ?? null;

  const floorRows = selectedChamber
    ? mergeChamberFloors({
        chamberName: selectedChamber.chamber,
        apiFloors: selectedChamber.floors,
        storageLayout,
        tab,
      })
    : [];

  const activeFloorName =
    floor && floor !== 'all' && floorRows.some((row) => row.floor === floor) ? floor : null;

  const selectedFloor =
    (activeFloorName ? floorRows.find((row) => row.floor === activeFloorName) : null) ??
    floorRows[0] ??
    null;

  const defaultFloorName = floorRows[0]?.floor ?? null;
  const floorNamesKey = floorRows.map((row) => row.floor).join('|');

  useEffect(() => {
    if (!defaultFloorName) return;
    const names = floorNamesKey ? floorNamesKey.split('|') : [];
    const hasValidSelection = Boolean(floor) && floor !== 'all' && names.includes(floor);
    if (!hasValidSelection) {
      onFloorChange(defaultFloorName);
    }
    // Parent recreates onFloorChange each render; only re-run on floor/data changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onFloorChange is unstable
  }, [defaultFloorName, floor, floorNamesKey]);

  if (!selectedChamber || !selectedChamberRow) return null;

  const totalStoreBags = chamberRows.reduce((sum, row) => sum + row.quantity, 0);
  const chamberBags = floorRows.reduce((sum, row) => sum + row.quantity, 0);

  const chamberAvailable = Math.max(
    selectedChamberRow.capacity - selectedChamberRow.currentTotal,
    0,
  );
  const chamberShareOfStore =
    totalStoreBags > 0 ? (selectedChamberRow.quantity / totalStoreBags) * 100 : 0;

  const floorPercent = selectedFloor?.utilization ?? 0;
  const floorAvailable = selectedFloor
    ? Math.max(selectedFloor.capacity - selectedFloor.currentTotal, 0)
    : 0;
  const floorShareOfChamber =
    selectedFloor && chamberBags > 0 ? (selectedFloor.quantity / chamberBags) * 100 : 0;

  return (
    <div className="border-border bg-card flex flex-col gap-6 rounded-xl border p-4 shadow-sm sm:p-6">
      <div className="border-border flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          Storage utilization
        </span>
        <UtilizationLegend />
      </div>

      <section className="space-y-3" aria-labelledby="chamber-utilization-heading">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2
            id="chamber-utilization-heading"
            className="font-heading text-foreground text-sm font-semibold"
          >
            1. Chambers
          </h2>
          <p className="text-muted-foreground text-xs">Select a chamber to view its floors</p>
        </div>

        {showInspectors ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
                {chamberRows.map((row) => (
                  <UtilizationMiniCard
                    key={row.chamber}
                    label={row.chamber}
                    utilization={row.utilization}
                    quantity={row.quantity}
                    selected={row.chamber === selectedChamber.chamber}
                    italic={isSentinelLabel(row.chamber)}
                    onClick={() => onChamberChange(row.chamber)}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-center lg:col-span-5">
              <UtilizationInspector
                title="Chamber Inspector"
                subtitle={selectedChamber.chamber}
                icon={Warehouse}
                utilization={selectedChamberRow.utilization}
                utilizedLabel={`${formatQuantity(selectedChamberRow.currentTotal)} / ${formatQuantity(selectedChamberRow.capacity)} bags utilized`}
                stats={[
                  {
                    label: 'Bags stored',
                    value: formatQuantity(selectedChamberRow.quantity),
                  },
                  {
                    label: 'Chamber capacity',
                    value: formatQuantity(selectedChamberRow.capacity),
                  },
                  {
                    label: 'Available space',
                    value: formatQuantity(chamberAvailable),
                    emphasize: true,
                  },
                  {
                    label: 'Share of store',
                    value: formatUtilizationDisplay(chamberShareOfStore),
                  },
                ]}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {chamberRows.map((row) => (
              <UtilizationMiniCard
                key={row.chamber}
                label={row.chamber}
                utilization={row.utilization}
                quantity={row.quantity}
                selected={row.chamber === selectedChamber.chamber}
                italic={isSentinelLabel(row.chamber)}
                onClick={() => onChamberChange(row.chamber)}
              />
            ))}
          </div>
        )}
      </section>

      <section
        className="border-border space-y-3 border-t pt-6"
        aria-labelledby="floor-utilization-heading"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2
            id="floor-utilization-heading"
            className="font-heading text-foreground text-sm font-semibold"
          >
            2. Floors · {selectedChamber.chamber}
          </h2>
          <p className="text-muted-foreground text-xs">Select a floor to view gate passes</p>
        </div>

        {showInspectors ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7">
              {floorRows.length === 0 ? (
                <p className="text-muted-foreground text-sm">No floor data for this chamber.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {floorRows.map((row) => (
                    <UtilizationMiniCard
                      key={row.floor}
                      label={row.floor}
                      utilization={row.utilization}
                      quantity={row.quantity}
                      selected={selectedFloor?.floor === row.floor}
                      italic={isSentinelLabel(row.floor)}
                      onClick={() => onFloorChange(row.floor)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center lg:col-span-5">
              {selectedFloor ? (
                <UtilizationInspector
                  title="Floor Inspector"
                  subtitle={`${selectedFloor.floor} · ${selectedChamber.chamber}`}
                  icon={Layers}
                  utilization={floorPercent}
                  utilizedLabel={`${formatQuantity(selectedFloor.currentTotal)} / ${formatQuantity(selectedFloor.capacity)} bags utilized`}
                  stats={[
                    {
                      label: 'Bags stored',
                      value: formatQuantity(selectedFloor.quantity),
                    },
                    {
                      label: 'Floor capacity',
                      value: formatQuantity(selectedFloor.capacity),
                    },
                    {
                      label: 'Available space',
                      value: formatQuantity(floorAvailable),
                      emphasize: true,
                    },
                    {
                      label: 'Share of chamber',
                      value: formatUtilizationDisplay(floorShareOfChamber),
                    },
                  ]}
                />
              ) : (
                <div className="border-border bg-background text-muted-foreground rounded-xl border border-dashed p-6 text-center text-sm">
                  Select a floor to inspect utilization.
                </div>
              )}
            </div>
          </div>
        ) : floorRows.length === 0 ? (
          <p className="text-muted-foreground text-sm">No floor data for this chamber.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {floorRows.map((row) => (
              <UtilizationMiniCard
                key={row.floor}
                label={row.floor}
                utilization={row.utilization}
                quantity={row.quantity}
                selected={selectedFloor?.floor === row.floor}
                italic={isSentinelLabel(row.floor)}
                onClick={() => onFloorChange(row.floor)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
