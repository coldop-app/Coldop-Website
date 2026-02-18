import { memo, useMemo, useState, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';

import {
  Item,
  ItemHeader,
  ItemMedia,
  ItemTitle,
  ItemActions,
} from '@/components/ui/item';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Package, RefreshCw, Wheat, Ruler, User } from 'lucide-react';
import { useGetStorageSummary } from '@/services/analytics/useGetStorageSummary';
import { useGetTopFarmers } from '@/services/analytics/useGetTopFarmers';
import { StorageSummaryTable } from '@/components/analytics/storage-summary-table';
import { useStore } from '@/stores/store';
import CapacityUtilisation from './capacity-utilisation';
import SizeDistributionChart from './size-distribution-chart';
import TopFarmersChart from './top-farmers-chart';
import VarietyDistribution from './variety-distribution';

type AnalyticsMode = 'current' | 'initial' | 'outgoing';

const AnalyticsPage = memo(function AnalyticsPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AnalyticsMode>('current');
  const { data, isLoading, error, refetch, isFetching } =
    useGetStorageSummary();
  const { data: topFarmersData } = useGetTopFarmers();

  const handleStockSummaryCellClick = useCallback(
    (variety: string, bagSize: string) => {
      navigate({
        to: '/store-admin/analytics/variety-breakdown',
        search: { variety, bagSize },
      });
    },
    [navigate]
  );
  const totalCapacity = useStore((s) => s.coldStorage?.capacity);
  const preferenceSizes = useStore(
    (s) => s.preferences?.commodities?.[0]?.sizes ?? []
  );

  /** Table size columns: preference order first, then any sizes from API not in preferences. */
  const sizesForTable = useMemo(() => {
    const fromApi = data?.chartData?.sizes ?? [];
    if (preferenceSizes.length === 0) return fromApi;
    const ordered = [...preferenceSizes];
    const seen = new Set(preferenceSizes.map((s) => s.trim()));
    for (const s of fromApi) {
      const t = (s ?? '').trim();
      if (t && !seen.has(t)) {
        seen.add(t);
        ordered.push(s);
      }
    }
    return ordered;
  }, [data?.chartData?.sizes, preferenceSizes]);

  /** Top variety by initial quantity (from stockSummary when mode is initial). */
  const topVarietyByInitial = useMemo(() => {
    const summary = data?.stockSummary;
    if (!summary?.length) return null;
    let top: { variety: string; initialQuantity: number } | null = null;
    for (const row of summary) {
      const sum = row.sizes.reduce((a, s) => a + s.initialQuantity, 0);
      if (sum > 0 && (!top || sum > top.initialQuantity)) {
        top = { variety: row.variety, initialQuantity: sum };
      }
    }
    return top;
  }, [data]);

  /** Top size by initial quantity (from stockSummary when mode is initial). */
  const topSizeByInitial = useMemo(() => {
    const summary = data?.stockSummary;
    if (!summary?.length) return null;
    const bySize = new Map<string, number>();
    for (const row of summary) {
      for (const s of row.sizes) {
        bySize.set(s.size, (bySize.get(s.size) ?? 0) + s.initialQuantity);
      }
    }
    let top: { size: string; initialQuantity: number } | null = null;
    for (const [size, qty] of bySize) {
      if (qty > 0 && (!top || qty > top.initialQuantity)) {
        top = { size, initialQuantity: qty };
      }
    }
    return top;
  }, [data]);

  /** Top variety by outgoing (initial - current) from stockSummary. */
  const topVarietyByOutgoing = useMemo(() => {
    const summary = data?.stockSummary;
    if (!summary?.length) return null;
    let top: { variety: string; outgoingQuantity: number } | null = null;
    for (const row of summary) {
      const sum = row.sizes.reduce(
        (a, s) => a + Math.max(0, s.initialQuantity - s.currentQuantity),
        0
      );
      if (sum > 0 && (!top || sum > top.outgoingQuantity)) {
        top = { variety: row.variety, outgoingQuantity: sum };
      }
    }
    return top;
  }, [data]);

  /** Top size by outgoing (initial - current) from stockSummary. */
  const topSizeByOutgoing = useMemo(() => {
    const summary = data?.stockSummary;
    if (!summary?.length) return null;
    const bySize = new Map<string, number>();
    for (const row of summary) {
      for (const s of row.sizes) {
        const out = Math.max(0, s.initialQuantity - s.currentQuantity);
        bySize.set(s.size, (bySize.get(s.size) ?? 0) + out);
      }
    }
    let top: { size: string; outgoingQuantity: number } | null = null;
    for (const [size, qty] of bySize) {
      if (qty > 0 && (!top || qty > top.outgoingQuantity)) {
        top = { size, outgoingQuantity: qty };
      }
    }
    return top;
  }, [data]);

  const totalInventory =
    mode === 'current'
      ? (data?.totalInventory.current ?? 0)
      : mode === 'initial'
        ? (data?.totalInventory.initial ?? 0)
        : Math.max(
            0,
            (data?.totalInventory.initial ?? 0) -
              (data?.totalInventory.current ?? 0)
          );

  /** Normalized to { variety, quantity } for display. */
  const topVarietyDisplay =
    mode === 'current' && data?.topVariety
      ? {
          variety: data.topVariety.variety,
          quantity: data.topVariety.currentQuantity,
        }
      : mode === 'initial' && topVarietyByInitial
        ? {
            variety: topVarietyByInitial.variety,
            quantity: topVarietyByInitial.initialQuantity,
          }
        : mode === 'outgoing' && topVarietyByOutgoing
          ? {
              variety: topVarietyByOutgoing.variety,
              quantity: topVarietyByOutgoing.outgoingQuantity,
            }
          : null;

  /** Normalized to { size, quantity } for display. */
  const topSizeDisplay =
    mode === 'current' && data?.topSize
      ? { size: data.topSize.size, quantity: data.topSize.currentQuantity }
      : mode === 'initial' && topSizeByInitial
        ? {
            size: topSizeByInitial.size,
            quantity: topSizeByInitial.initialQuantity,
          }
        : mode === 'outgoing' && topSizeByOutgoing
          ? {
              size: topSizeByOutgoing.size,
              quantity: topSizeByOutgoing.outgoingQuantity,
            }
          : null;

  /** Top farmer by current quantity, initial quantity, or quantity removed (outgoing) per tab. */
  const topFarmerDisplay = (() => {
    if (!topFarmersData) return null;
    const series =
      mode === 'current'
        ? topFarmersData.byCurrentQuantity
        : mode === 'initial'
          ? topFarmersData.byInitialQuantity
          : topFarmersData.byQuantityRemoved;
    const first = series?.[0];
    return first && first.value > 0
      ? { name: first.name, quantity: first.value }
      : null;
  })();

  return (
    <main className="mx-auto max-w-7xl p-2 sm:p-4 lg:p-6">
      <div className="space-y-6">
        {/* Header: title + refresh */}
        <Item variant="outline" size="sm" className="rounded-xl shadow-sm">
          <ItemHeader className="h-full">
            <div className="flex items-center gap-3">
              <ItemMedia variant="icon" className="rounded-lg">
                <BarChart3 className="text-primary h-5 w-5" />
              </ItemMedia>
              <ItemTitle className="font-custom text-sm font-semibold sm:text-base">
                Analytics
              </ItemTitle>
            </div>
            <ItemActions>
              <Button
                variant="outline"
                size="sm"
                className="font-custom focus-visible:ring-primary h-8 gap-2 rounded-lg px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                aria-label="Refresh analytics"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <RefreshCw
                  className={`h-4 w-4 shrink-0 ${isFetching ? 'animate-spin' : ''}`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </ItemActions>
          </ItemHeader>
        </Item>

        {/* Content */}
        <div className="min-h-[200px] w-full">
          {isLoading ? (
            <p className="font-custom text-muted-foreground text-sm">
              Loading storage summary…
            </p>
          ) : error ? (
            <p className="font-custom text-destructive text-sm">
              {error instanceof Error
                ? error.message
                : 'Failed to load analytics'}
            </p>
          ) : data ? (
            <div className="space-y-6">
              {/* Mode tabs: Current | Initial */}
              <Tabs
                value={mode}
                onValueChange={(v) => setMode(v as AnalyticsMode)}
                className="w-full"
              >
                <TabsList className="font-custom grid h-9 w-full grid-cols-3">
                  <TabsTrigger value="current">Current</TabsTrigger>
                  <TabsTrigger value="initial">Initial</TabsTrigger>
                  <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Stats: Total inventory, Top variety, Top size (driven by tab) */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-border rounded-xl shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="font-custom text-muted-foreground text-sm font-medium">
                      Total inventory ({mode})
                    </CardTitle>
                    <Package className="text-primary h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <p className="font-custom text-primary text-2xl font-bold tabular-nums">
                      {totalInventory.toLocaleString('en-IN')}
                    </p>
                    <p className="font-custom text-muted-foreground text-xs">
                      {mode === 'current'
                        ? 'Bags in storage'
                        : mode === 'initial'
                          ? 'Bags received'
                          : 'Bags released'}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-border rounded-xl shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="font-custom text-muted-foreground text-sm font-medium">
                      Top variety
                    </CardTitle>
                    <Wheat className="text-muted-foreground h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <p className="font-custom text-foreground text-lg font-semibold">
                      {topVarietyDisplay?.variety ?? '—'}
                    </p>
                    <p className="font-custom text-muted-foreground text-xs tabular-nums">
                      {topVarietyDisplay != null
                        ? `${topVarietyDisplay.quantity.toLocaleString('en-IN')} bags`
                        : 'No data'}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-border rounded-xl shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="font-custom text-muted-foreground text-sm font-medium">
                      Top bag size
                    </CardTitle>
                    <Ruler className="text-muted-foreground h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <p className="font-custom text-foreground text-lg font-semibold">
                      {topSizeDisplay?.size ?? '—'}
                    </p>
                    <p className="font-custom text-muted-foreground text-xs tabular-nums">
                      {topSizeDisplay != null
                        ? `${topSizeDisplay.quantity.toLocaleString('en-IN')} bags`
                        : 'No data'}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-border rounded-xl shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="font-custom text-muted-foreground text-sm font-medium">
                      Top farmer
                    </CardTitle>
                    <User className="text-muted-foreground h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <p className="font-custom text-foreground text-lg font-semibold">
                      {topFarmerDisplay?.name ?? '—'}
                    </p>
                    <p className="font-custom text-muted-foreground text-xs tabular-nums">
                      {topFarmerDisplay != null
                        ? `${topFarmerDisplay.quantity.toLocaleString('en-IN')} bags`
                        : 'No data'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Summary table (synced with page tab) */}
              <StorageSummaryTable
                stockSummary={data.stockSummary}
                sizes={sizesForTable}
                controlledTab={mode}
                onCellClick={handleStockSummaryCellClick}
              />

              <CapacityUtilisation
                currentQuantity={
                  mode === 'current'
                    ? data.totalInventory.current
                    : mode === 'initial'
                      ? data.totalInventory.initial
                      : Math.max(
                          0,
                          data.totalInventory.initial -
                            data.totalInventory.current
                        )
                }
                totalCapacity={totalCapacity}
                totalCurrentInventory={data.totalInventory.current}
                quantityType={mode}
              />

              <VarietyDistribution
                stockSummary={data.stockSummary}
                quantityType={mode}
              />

              <SizeDistributionChart
                stockSummary={data.stockSummary}
                quantityType={mode}
              />

              <TopFarmersChart quantityType={mode} />
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
});

export default AnalyticsPage;
