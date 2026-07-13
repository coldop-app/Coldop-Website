import { useEffect, useMemo, useState } from 'react';
import { Layers, RefreshCw, Search, User } from 'lucide-react';

import { ListPaginationFooter } from '@/components/list-pagination-footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatQuantity } from '@/features/daybook/utils/format';
import { cn } from '@/lib/utils';

import { useLocationAnalytics } from '../api/use-location-analytics';
import type { LocationAnalyticsFarmer, LocationAnalyticsQuantityTab } from '../types';
import {
  buildFarmerLocationChambers,
  farmerHasStockForTab,
  filterFarmerRowsByName,
  withFilteredShares,
} from '../utils/build-farmer-location-chambers';
import { buildFarmerRows, findFarmerById } from '../utils/build-farmer-rows';
import { filterChamberOrders } from '../utils/filter-chamber-orders';
import { findChamberByName, resolveChamberTabs } from '../utils/resolve-chamber-tabs';
import { ChamberFloorUtilizationMap } from './chamber-floor-utilization-map';
import { ChamberOrdersTable } from './chamber-orders-table';

const FARMER_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

function formatShare(value: number): string {
  return `${value.toLocaleString('en-IN', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

type ChamberAnalyticsFarmerTabProps = {
  tab: LocationAnalyticsQuantityTab;
  enabled: boolean;
};

function FarmerTabSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-64 w-full rounded-xl" />
      <Skeleton className="h-80 w-full rounded-xl" />
    </div>
  );
}

function FarmerLocationDetail({
  farmer,
  tab,
}: {
  farmer: LocationAnalyticsFarmer;
  tab: LocationAnalyticsQuantityTab;
}) {
  const chambers = useMemo(() => buildFarmerLocationChambers(farmer), [farmer]);

  const [chamber, setChamber] = useState<string | undefined>(undefined);
  const [floor, setFloor] = useState('');

  useEffect(() => {
    setChamber(undefined);
    setFloor('');
  }, [farmer.farmerId]);

  const { activeChamber } = resolveChamberTabs(chambers, chamber);
  const selectedChamber = findChamberByName(chambers, activeChamber);
  const activeFloor = floor && floor !== 'all' ? floor : null;
  const filteredOrders =
    selectedChamber && activeFloor
      ? filterChamberOrders(selectedChamber.orders, activeFloor, tab)
      : [];

  const hasStock = farmerHasStockForTab(chambers, tab);

  return (
    <div className="flex flex-col gap-6">
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle className="font-heading text-foreground text-base font-semibold">
            {farmer.farmerName}
          </CardTitle>
          <CardDescription>
            Account #{farmer.accountNumber} · {farmer.orderCount}{' '}
            {farmer.orderCount === 1 ? 'pass' : 'passes'} · stock by chamber and floor
          </CardDescription>
        </CardHeader>
      </Card>

      {!hasStock || chambers.length === 0 ? (
        <Empty className="border-border bg-card rounded-xl border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Layers />
            </EmptyMedia>
            <EmptyTitle>No location stock</EmptyTitle>
            <EmptyDescription>
              This farmer has no bags assigned to chambers or floors for the selected quantity mode.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          {activeChamber ? (
            <ChamberFloorUtilizationMap
              chambers={chambers}
              activeChamber={activeChamber}
              floor={floor}
              tab={tab}
              showInspectors={false}
              onChamberChange={(value) => {
                setChamber(value);
                setFloor('');
              }}
              onFloorChange={setFloor}
            />
          ) : null}

          {activeFloor && activeChamber ? (
            <ChamberOrdersTable
              orders={filteredOrders}
              chamberLabel={activeChamber}
              floorLabel={activeFloor}
            />
          ) : (
            <Empty className="border-border bg-card rounded-xl border border-dashed">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Layers />
                </EmptyMedia>
                <EmptyTitle>Select a floor</EmptyTitle>
                <EmptyDescription>
                  Click a floor card above to view this farmer&apos;s gate passes.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </>
      )}
    </div>
  );
}

export function ChamberAnalyticsFarmerTab({ tab, enabled }: ChamberAnalyticsFarmerTabProps) {
  const analytics = useLocationAnalytics({ enabled });
  const farmers = analytics.response?.data?.byFarmer ?? [];

  const allRows = useMemo(() => buildFarmerRows(farmers, tab), [farmers, tab]);

  const [searchQuery, setSearchQuery] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedFarmerId, setSelectedFarmerId] = useState<string | null>(null);

  const filteredRows = useMemo(
    () => withFilteredShares(filterFarmerRowsByName(allRows, searchQuery)),
    [allRows, searchQuery],
  );

  const totalPages = Math.max(Math.ceil(filteredRows.length / pageSize), 1);
  const safePageIndex = Math.min(pageIndex, totalPages - 1);

  const pageRows = useMemo(() => {
    const start = safePageIndex * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, pageSize, safePageIndex]);

  useEffect(() => {
    setPageIndex(0);
  }, [searchQuery, pageSize]);

  useEffect(() => {
    if (filteredRows.length === 0) {
      setSelectedFarmerId(null);
      return;
    }

    if (!selectedFarmerId || !filteredRows.some((row) => row.farmerId === selectedFarmerId)) {
      setSelectedFarmerId(filteredRows[0]?.farmerId ?? null);
    }
  }, [filteredRows, selectedFarmerId]);

  const selectedFarmer = findFarmerById(farmers, selectedFarmerId);
  const filteredBagsTotal = filteredRows.reduce((sum, row) => sum + row.totalBags, 0);
  const filteredPassesTotal = filteredRows.reduce((sum, row) => sum + row.orderCount, 0);

  const rangeStart =
    filteredRows.length === 0 ? 0 : Math.min(safePageIndex * pageSize + 1, filteredRows.length);
  const rangeEnd =
    filteredRows.length === 0 ? 0 : Math.min((safePageIndex + 1) * pageSize, filteredRows.length);

  if (analytics.isLoading) {
    return <FarmerTabSkeleton />;
  }

  if (analytics.isError) {
    return (
      <Empty className="border-border bg-card rounded-xl border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <RefreshCw />
          </EmptyMedia>
          <EmptyTitle>Could not load farmer analytics</EmptyTitle>
          <EmptyDescription>
            {analytics.error instanceof Error
              ? analytics.error.message
              : 'Something went wrong while fetching farmer data.'}
          </EmptyDescription>
        </EmptyHeader>
        <Button variant="outline" size="sm" onClick={() => void analytics.refetch()}>
          <RefreshCw className="mr-2 size-4" />
          Try again
        </Button>
      </Empty>
    );
  }

  if (allRows.length === 0) {
    return (
      <Empty className="border-border bg-card rounded-xl border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <User />
          </EmptyMedia>
          <EmptyTitle>No farmer data</EmptyTitle>
          <EmptyDescription>
            There are no gate passes with stock to show by farmer.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle className="font-heading text-base font-semibold">Farmer summary</CardTitle>
          <CardDescription>
            {tab === 'current' ? 'Current quantity' : 'Initial quantity'} across all locations
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div className="relative w-full">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              placeholder="Search farmer name"
              className="w-full pl-10"
              inputMode="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              aria-label="Search farmer name"
            />
          </div>

          {filteredRows.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No farmers match &ldquo;{searchQuery.trim()}&rdquo;.
            </p>
          ) : (
            <>
              <div className="border-border overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="bg-muted/50 text-muted-foreground sticky left-0 z-10 h-10 px-3 font-medium">
                        Farmer
                      </TableHead>
                      <TableHead className="text-muted-foreground h-10 px-3 text-right font-medium">
                        Account #
                      </TableHead>
                      <TableHead className="text-muted-foreground h-10 px-3 text-right font-medium">
                        Passes
                      </TableHead>
                      <TableHead className="text-muted-foreground h-10 px-3 text-right font-medium">
                        Bags
                      </TableHead>
                      <TableHead className="bg-primary/5 text-muted-foreground h-10 px-3 text-right font-medium">
                        Share
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {pageRows.map((row) => {
                      const isSelected = row.farmerId === selectedFarmerId;

                      return (
                        <TableRow
                          key={row.farmerId}
                          data-state={isSelected ? 'selected' : undefined}
                          className={cn(
                            'cursor-pointer',
                            isSelected && 'bg-primary/5 hover:bg-primary/10',
                          )}
                          onClick={() => setSelectedFarmerId(row.farmerId)}
                        >
                          <TableCell
                            className={cn(
                              'bg-background sticky left-0 z-10 px-3 py-2.5 font-medium',
                              isSelected ? 'text-primary' : 'text-foreground',
                            )}
                            title={row.farmerName}
                          >
                            <span className="block truncate">{row.farmerName}</span>
                          </TableCell>
                          <TableCell className="text-foreground px-3 py-2.5 text-right tabular-nums">
                            {row.accountNumber}
                          </TableCell>
                          <TableCell className="text-foreground px-3 py-2.5 text-right tabular-nums">
                            {row.orderCount}
                          </TableCell>
                          <TableCell className="text-foreground px-3 py-2.5 text-right font-medium tabular-nums">
                            {formatQuantity(row.totalBags)}
                          </TableCell>
                          <TableCell className="bg-primary/5 text-primary px-3 py-2.5 text-right font-medium tabular-nums">
                            {formatShare(row.share)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>

                  <TableFooter className="bg-muted/30">
                    <TableRow>
                      <TableCell className="bg-muted/30 text-foreground sticky left-0 z-10 px-3 py-2.5 font-semibold">
                        Total
                        {searchQuery.trim() ? ' (filtered)' : ''}
                      </TableCell>
                      <TableCell />
                      <TableCell className="text-foreground px-3 py-2.5 text-right font-semibold tabular-nums">
                        {filteredPassesTotal}
                      </TableCell>
                      <TableCell className="text-foreground px-3 py-2.5 text-right font-semibold tabular-nums">
                        {formatQuantity(filteredBagsTotal)}
                      </TableCell>
                      <TableCell className="bg-primary/5 text-primary px-3 py-2.5 text-right font-semibold tabular-nums">
                        {formatShare(100)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>

              <ListPaginationFooter
                rangeStart={rangeStart}
                rangeEnd={rangeEnd}
                totalItems={filteredRows.length}
                itemLabel="farmers"
                currentPage={safePageIndex + 1}
                totalPages={totalPages}
                pageSize={pageSize}
                pageSizeOptions={FARMER_PAGE_SIZE_OPTIONS}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setPageIndex(0);
                }}
                onPreviousPage={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
                onNextPage={() => setPageIndex((prev) => Math.min(prev + 1, totalPages - 1))}
                onGoToPage={(page) => setPageIndex(page - 1)}
                attached
              />
            </>
          )}
        </CardContent>
      </Card>

      {selectedFarmer ? (
        <FarmerLocationDetail farmer={selectedFarmer} tab={tab} />
      ) : (
        <Empty className="border-border bg-card rounded-xl border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <User />
            </EmptyMedia>
            <EmptyTitle>Select a farmer</EmptyTitle>
            <EmptyDescription>
              Tap a row in the table above to view chamber and floor stock.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}
