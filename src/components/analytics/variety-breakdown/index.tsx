import { useState, useMemo } from 'react';
import { useSearch } from '@tanstack/react-router';
import {
  Item,
  ItemHeader,
  ItemMedia,
  ItemTitle,
  ItemActions,
} from '@/components/ui/item';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BarChart3, Package, RefreshCw } from 'lucide-react';
import { useStore } from '@/stores/store';
import { useVarietyBreakdown } from '@/services/analytics/useVarietyBreakdown';
import type { VarietyBreakdownSize, VarietyBreakdownFarmer } from '@/services/analytics/useVarietyBreakdown';
import {
  type QuantityType,
  QUANTITY_TYPE_LABELS,
  getQuantity,
} from './types';
import SizeWiseDistributionChart from './size-wise-distribution-chart';
import FarmerWiseShareChart from './farmer-wise-share-chart';
import FarmerQuantityTable, {
  type FarmerQuantityRow,
  type FarmerQuantityRowAllSizes,
} from './farmer-quantity-table';

const TAB_VALUE_ALL = 'all';

function getQuantityFromSize(
  size: VarietyBreakdownSize,
  type: QuantityType
): number {
  return getQuantity(
    size.initialQuantity ?? 0,
    size.currentQuantity ?? 0,
    type
  );
}

function getQuantityFromFarmer(
  f: VarietyBreakdownFarmer,
  type: QuantityType
): number {
  return getQuantity(
    f.initialQuantity ?? 0,
    f.currentQuantity ?? 0,
    type
  );
}

const VarietyBreakdownScreen = () => {
  const search = useSearch({
    from: '/store-admin/_authenticated/analytics/variety-breakdown/',
  });
  const variety = search.variety ?? '';
  const bagSizeFromUrl = search.bagSize ?? '';

  const preferenceSizes = useStore(
    (s) => s.preferences?.commodities?.[0]?.sizes ?? []
  );

  const { data, isLoading, error, refetch, isFetching } =
    useVarietyBreakdown(variety);

  const [quantityType, setQuantityType] = useState<QuantityType>('current');
  const [selectedBagSize, setSelectedBagSize] = useState<string>(() =>
    bagSizeFromUrl && preferenceSizes.includes(bagSizeFromUrl)
      ? bagSizeFromUrl
      : TAB_VALUE_ALL
  );

  const sizeLabelForTitle =
    selectedBagSize === TAB_VALUE_ALL ? 'All' : selectedBagSize;
  const title = variety
    ? `${variety} · ${sizeLabelForTitle}`
    : 'Variety breakdown';

  const sizeToCount = useMemo(() => {
    const map = new Map<string, number>();
    if (data?.sizes) {
      for (const s of data.sizes) {
        const key = (s.size ?? '').trim();
        if (key) {
          map.set(
            key,
            (map.get(key) ?? 0) + getQuantityFromSize(s, quantityType)
          );
        }
      }
    }
    return map;
  }, [data, quantityType]);

  const tabTriggers = useMemo(() => {
    const list: { value: string; label: string }[] = [
      { value: TAB_VALUE_ALL, label: 'All' },
    ];
    for (const size of preferenceSizes) {
      const trimmed = size?.trim();
      if (trimmed) {
        const count = sizeToCount.get(trimmed) ?? 0;
        list.push({
          value: trimmed,
          label: count > 0 ? `${trimmed} (${count})` : trimmed,
        });
      }
    }
    return list;
  }, [preferenceSizes, sizeToCount]);

  const filteredSizes = useMemo((): VarietyBreakdownSize[] => {
    if (!data?.sizes) return [];
    if (selectedBagSize === TAB_VALUE_ALL) return data.sizes;
    return data.sizes.filter(
      (s) => (s.size ?? '').trim() === selectedBagSize
    );
  }, [data, selectedBagSize]);

  const sizeWiseChartData = useMemo(() => {
    const list: { name: string; value: number }[] = [];
    for (const s of filteredSizes) {
      const q = getQuantityFromSize(s, quantityType);
      if (q <= 0) continue;
      const name = (s.size ?? '').trim() || '—';
      list.push({ name, value: q });
    }
    list.sort((a, b) => b.value - a.value);
    return list;
  }, [filteredSizes, quantityType]);

  const farmerAggregate = useMemo(() => {
    const byName = new Map<string, number>();
    for (const size of filteredSizes) {
      for (const f of size.farmerBreakdown ?? []) {
        const q = getQuantityFromFarmer(f, quantityType);
        if (q <= 0) continue;
        const name = (f.farmerName ?? '').trim() || '—';
        byName.set(name, (byName.get(name) ?? 0) + q);
      }
    }
    return Array.from(byName.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredSizes, quantityType]);

  const totalQuantity = useMemo(
    () => farmerAggregate.reduce((sum, d) => sum + d.value, 0),
    [farmerAggregate]
  );

  const farmerWiseChartData = useMemo(
    () => farmerAggregate.map((d) => ({ name: d.name, value: d.value })),
    [farmerAggregate]
  );

  const tableRows = useMemo((): FarmerQuantityRow[] => {
    if (totalQuantity <= 0) return farmerAggregate.map((d) => ({
      farmerName: d.name,
      quantity: d.value,
      percentage: 0,
    }));
    return farmerAggregate.map((d) => ({
      farmerName: d.name,
      quantity: d.value,
      percentage: (d.value / totalQuantity) * 100,
    }));
  }, [farmerAggregate, totalQuantity]);

  /** When "All sizes" is selected: columns = preference sizes; rows = per-farmer quantities per size */
  const sizeColumnsForTable = useMemo(() => {
    if (selectedBagSize !== TAB_VALUE_ALL) return [];
    return preferenceSizes.filter((s) => (s ?? '').trim());
  }, [selectedBagSize, preferenceSizes]);

  const tableRowsAllSizes = useMemo((): FarmerQuantityRowAllSizes[] => {
    if (selectedBagSize !== TAB_VALUE_ALL || !data?.sizes) return [];
    const byFarmer = new Map<string, Record<string, number>>();
    for (const sizeObj of data.sizes) {
      const sizeKey = (sizeObj.size ?? '').trim();
      if (!sizeKey) continue;
      for (const f of sizeObj.farmerBreakdown ?? []) {
        const q = getQuantityFromFarmer(f, quantityType);
        if (q <= 0) continue;
        const name = (f.farmerName ?? '').trim() || '—';
        if (!byFarmer.has(name)) {
          byFarmer.set(name, {});
        }
        const row = byFarmer.get(name)!;
        row[sizeKey] = (row[sizeKey] ?? 0) + q;
      }
    }
    const totalAll = Array.from(byFarmer.values()).reduce(
      (sum, qtyBySize) =>
        sum + Object.values(qtyBySize).reduce((a, b) => a + b, 0),
      0
    );
    return Array.from(byFarmer.entries())
      .map(([farmerName, quantitiesBySize]) => {
        const total = Object.values(quantitiesBySize).reduce((a, b) => a + b, 0);
        const percentage = totalAll > 0 ? (total / totalAll) * 100 : 0;
        return { farmerName, quantitiesBySize, total, percentage };
      })
      .sort((a, b) => b.total - a.total);
  }, [data, selectedBagSize, quantityType]);

  const sizeLabel = useMemo(
    () =>
      selectedBagSize === TAB_VALUE_ALL ? 'All sizes' : selectedBagSize,
    [selectedBagSize]
  );

  return (
    <main className="mx-auto max-w-7xl p-2 sm:p-4 lg:p-6">
      <div className="space-y-6">
        <Item variant="outline" size="sm" className="rounded-xl shadow-sm">
          <ItemHeader className="h-full">
            <div className="flex items-center gap-3">
              <ItemMedia variant="icon" className="rounded-lg">
                <BarChart3 className="text-primary h-5 w-5" />
              </ItemMedia>
              <ItemTitle className="font-custom text-sm font-semibold sm:text-base">
                {title}
              </ItemTitle>
            </div>
            <ItemActions>
              <Button
                variant="outline"
                size="sm"
                className="font-custom focus-visible:ring-primary h-8 gap-2 rounded-lg px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                aria-label="Refresh variety breakdown"
                onClick={() => refetch()}
                disabled={isFetching}
                aria-busy={isFetching}
              >
                <RefreshCw
                  className={`h-4 w-4 shrink-0 ${
                    isFetching ? 'animate-spin' : ''
                  }`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </ItemActions>
          </ItemHeader>
        </Item>

        {isLoading && (
          <p className="text-muted-foreground font-custom text-sm">
            Loading…
          </p>
        )}
        {error && (
          <p className="font-custom text-destructive text-sm">
            Failed to load variety breakdown.
          </p>
        )}

        {data && (
          <>
            {/* Quantity type: Current | Initial | Outgoing — same style as main Analytics tabs */}
            <Tabs
              value={quantityType}
              onValueChange={(v) => setQuantityType(v as QuantityType)}
              className="w-full"
            >
              <TabsList className="font-custom grid h-9 w-full grid-cols-3">
                {(['current', 'initial', 'outgoing'] as const).map((t) => (
                  <TabsTrigger key={t} value={t}>
                    {QUANTITY_TYPE_LABELS[t]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Filter by Bag Size — same tab style as main Analytics */}
            {preferenceSizes.length > 0 && (
              <Tabs
                value={selectedBagSize}
                onValueChange={(v) => setSelectedBagSize(v)}
                className="w-full"
              >
                <TabsList className="font-custom flex h-9 w-full flex-wrap items-center">
                  {tabTriggers.map((t) => (
                    <TabsTrigger key={t.value} value={t.value}>
                      {t.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}

            {/* Summary cards: Variety (pill) + Total Quantity */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-border rounded-xl shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="font-custom text-muted-foreground text-sm font-medium">
                    Variety
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="font-custom inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-sm font-medium text-foreground">
                    {data.variety || '—'}
                  </span>
                </CardContent>
              </Card>
              <Card className="border-border rounded-xl shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="font-custom text-muted-foreground text-sm font-medium">
                    Total quantity
                  </CardTitle>
                  <Package className="text-primary h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <p className="font-custom text-primary text-2xl font-bold tabular-nums">
                    {totalQuantity.toLocaleString('en-IN')}
                  </p>
                  <p className="font-custom text-muted-foreground text-xs">
                    bags
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Farmer quantity table */}
            <FarmerQuantityTable
              rows={tableRows}
              quantityType={quantityType}
              sizeLabel={sizeLabel}
              sizeColumns={
                sizeColumnsForTable.length > 0 ? sizeColumnsForTable : undefined
              }
              rowsAllSizes={
                sizeColumnsForTable.length > 0 ? tableRowsAllSizes : undefined
              }
              quantityColumnLabel={
                selectedBagSize !== TAB_VALUE_ALL ? selectedBagSize : undefined
              }
            />

            {/* Charts: Size-wise (bar) + Farmer-wise (donut) */}
            <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-2">
              <SizeWiseDistributionChart
                data={sizeWiseChartData}
                quantityType={quantityType}
              />
              <FarmerWiseShareChart
                data={farmerWiseChartData}
                quantityType={quantityType}
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default VarietyBreakdownScreen;
