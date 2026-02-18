import { useMemo, useState } from 'react';
import {
  Item,
  ItemHeader,
  ItemMedia,
  ItemTitle,
  ItemActions,
} from '@/components/ui/item';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
  BarChart3,
  RefreshCw,
  MapPin,
  User,
  Package,
  ChevronLeft,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { format } from 'date-fns';
import { useGetAllIncomingGatePasses } from '@/services/analytics/useGetAllIncomingGatePasses';
import type {
  IncomingGatePass,
  IncomingGatePassBagSize,
} from '@/services/analytics/useGetAllIncomingGatePasses';

const EMPTY_CHAMBER = '(No chamber)';

type ChamberEntry = {
  pass: IncomingGatePass;
  bagSizesInChamber: IncomingGatePassBagSize[];
};

/** Build flat list of (chamber, pass, bagSizesInChamber) then group by chamber using Object.groupBy */
function groupByChamber(passes: IncomingGatePass[]) {
  const flatEntries: (ChamberEntry & { chamber: string })[] = [];
  for (const pass of passes) {
    const byChamberInPass = Object.groupBy(
      pass.bagSizes ?? [],
      (bag: IncomingGatePassBagSize) =>
        (bag.location?.chamber ?? '').trim() || EMPTY_CHAMBER
    ) as Partial<Record<string, IncomingGatePassBagSize[]>>;
    for (const [chamber, bags] of Object.entries(byChamberInPass)) {
      if (chamber != null && bags?.length) {
        flatEntries.push({ chamber, pass, bagSizesInChamber: bags });
      }
    }
  }
  return Object.groupBy(
    flatEntries,
    (entry: ChamberEntry & { chamber: string }) => entry.chamber
  );
}

/** Group passes by farmer using Object.groupBy */
function groupByFarmer(passes: IncomingGatePass[]) {
  return Object.groupBy(
    passes,
    (pass: IncomingGatePass) =>
      pass.farmerStorageLinkId?.farmerId?._id ?? '(Unknown)'
  );
}

const EMPTY_FLOOR = '(No floor)';

/** Get unique floors for a chamber from chamber entries */
function getUniqueFloorsForChamber(
  entries: (ChamberEntry & { chamber: string })[]
): string[] {
  const set = new Set<string>();
  for (const { bagSizesInChamber } of entries) {
    for (const bag of bagSizesInChamber) {
      const floor = (bag.location?.floor ?? '').trim() || EMPTY_FLOOR;
      set.add(floor);
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

/** One row for the orders table: pass + one bag in selected chamber+floor */
type OrderRow = {
  pass: IncomingGatePass;
  bag: IncomingGatePassBagSize;
};

/** Filter chamber entries to those with at least one bag on selected floors; flatten to (pass, bag) rows */
function getOrderRowsForChamberAndFloors(
  entries: (ChamberEntry & { chamber: string })[],
  selectedFloors: string[]
): OrderRow[] {
  const rows: OrderRow[] = [];
  const floorSet = new Set(selectedFloors);
  for (const { pass, bagSizesInChamber } of entries) {
    for (const bag of bagSizesInChamber) {
      const floor = (bag.location?.floor ?? '').trim() || EMPTY_FLOOR;
      if (floorSet.has(floor)) rows.push({ pass, bag });
    }
  }
  return rows;
}

type GetQuantityFn = (bag: IncomingGatePassBagSize) => number;

/** Sum quantity across all bags in chamber entries */
function getChamberTotal(
  entries: (ChamberEntry & { chamber: string })[],
  getQty: GetQuantityFn
): number {
  let total = 0;
  for (const { bagSizesInChamber } of entries) {
    for (const bag of bagSizesInChamber) {
      total += getQty(bag);
    }
  }
  return total;
}

/** Total quantity per floor for given chamber entries */
function getFloorTotalsForChamber(
  entries: (ChamberEntry & { chamber: string })[],
  getQty: GetQuantityFn
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const { bagSizesInChamber } of entries) {
    for (const bag of bagSizesInChamber) {
      const floor = (bag.location?.floor ?? '').trim() || EMPTY_FLOOR;
      out[floor] = (out[floor] ?? 0) + getQty(bag);
    }
  }
  return out;
}

const AdvancedAnalyticsPage = () => {
  const { data, isLoading, error, refetch, isFetching } =
    useGetAllIncomingGatePasses();

  const byChamber = useMemo(
    () =>
      (data ? groupByChamber(data) : {}) as Record<
        string,
        (ChamberEntry & { chamber: string })[]
      >,
    [data]
  );
  const byFarmer = useMemo(
    () =>
      (data ? groupByFarmer(data) : {}) as Record<string, IncomingGatePass[]>,
    [data]
  );

  const chambersSorted = useMemo(
    () => Object.keys(byChamber).sort((a, b) => a.localeCompare(b)),
    [byChamber]
  );
  const farmersSorted = useMemo(
    () =>
      Object.entries(byFarmer).sort((a, b) => {
        const nameA =
          a[1][0]?.farmerStorageLinkId?.farmerId?.name ?? '';
        const nameB =
          b[1][0]?.farmerStorageLinkId?.farmerId?.name ?? '';
        return nameA.localeCompare(nameB);
      }),
    [byFarmer]
  );

  // Location drill-down: chambers → floors → orders
  type LocationStage = 'chambers' | 'floors' | 'orders';
  const [locationStage, setLocationStage] = useState<LocationStage>('chambers');
  const [selectedChamber, setSelectedChamber] = useState<string | null>(null);
  const [selectedFloors, setSelectedFloors] = useState<string[]>([]);

  const chamberEntries = useMemo(
    () => (selectedChamber ? byChamber[selectedChamber] ?? [] : []),
    [selectedChamber, byChamber]
  );
  const floorsInChamber = useMemo(
    () => getUniqueFloorsForChamber(chamberEntries),
    [chamberEntries]
  );
  const orderRows = useMemo(
    () =>
      selectedChamber && selectedFloors.length > 0
        ? getOrderRowsForChamberAndFloors(chamberEntries, selectedFloors)
        : [],
    [selectedChamber, selectedFloors, chamberEntries]
  );

  // Quantity view: show current or initial quantities in Location/Farmer content
  type QuantityView = 'current' | 'initial';
  const [quantityView, setQuantityView] = useState<QuantityView>('current');
  const getQuantity = (bag: IncomingGatePassBagSize) =>
    quantityView === 'current' ? bag.currentQuantity : bag.initialQuantity;
  const quantityLabel = quantityView === 'current' ? 'Current' : 'Initial';

  /** Aggregation per chamber (for chamber cards) */
  const chamberTotals = useMemo(() => {
    const getQty = (bag: IncomingGatePassBagSize) =>
      quantityView === 'current' ? bag.currentQuantity : bag.initialQuantity;
    const out: Record<string, number> = {};
    for (const chamber of chambersSorted) {
      const entries = byChamber[chamber] ?? [];
      out[chamber] = getChamberTotal(entries, getQty);
    }
    return out;
  }, [chambersSorted, byChamber, quantityView]);

  /** Aggregation per floor for the selected chamber (for floors view) */
  const floorTotals = useMemo(() => {
    const getQty = (bag: IncomingGatePassBagSize) =>
      quantityView === 'current' ? bag.currentQuantity : bag.initialQuantity;
    return getFloorTotalsForChamber(chamberEntries, getQty);
  }, [chamberEntries, quantityView]);

  const handleChamberClick = (chamber: string) => {
    setSelectedChamber(chamber);
    setSelectedFloors([]);
    setLocationStage('floors');
  };
  const handleBackToChambers = () => {
    setSelectedChamber(null);
    setSelectedFloors([]);
    setLocationStage('chambers');
  };
  const handleBackToFloors = () => {
    setLocationStage('floors');
  };
  const handleFloorToggle = (floor: string, checked: boolean) => {
    setSelectedFloors((prev) =>
      checked ? [...prev, floor] : prev.filter((f) => f !== floor)
    );
  };
  const handleSelectAllFloors = (checked: boolean) => {
    setSelectedFloors(checked ? [...floorsInChamber] : []);
  };
  const handleViewOrders = () => setLocationStage('orders');

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
                Advanced Analytics
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

        {/* Content: tabs */}
        <div className="min-h-[200px] w-full">
          <h2 className="font-custom text-lg font-semibold text-foreground sm:text-xl">
            Incoming gate passes (orders)
          </h2>
          {isLoading ? (
            <p className="font-custom text-muted-foreground mt-2 text-sm">
              Loading…
            </p>
          ) : error ? (
            <p className="font-custom text-destructive mt-2 text-sm">
              {error instanceof Error ? error.message : 'Failed to load orders'}
            </p>
          ) : data != null ? (
            (() => {
              const innerLocationFarmerTabs = (
                <Tabs defaultValue="location">
                  <TabsList variant="default" className="gap-1 mt-1">
                    <TabsTrigger value="location" className="gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </TabsTrigger>
                    <TabsTrigger value="farmer" className="gap-2">
                      <User className="h-4 w-4" />
                      Farmer
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="location" className="mt-4">
                <div className="space-y-4">
                  {/* Breadcrumb / back */}
                  {locationStage !== 'chambers' && (
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 font-custom text-muted-foreground hover:text-foreground"
                        onClick={
                          locationStage === 'orders'
                            ? handleBackToFloors
                            : handleBackToChambers
                        }
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Back to{' '}
                        {locationStage === 'orders' ? 'floors' : 'chambers'}
                      </Button>
                      {selectedChamber && (
                        <span className="font-custom text-muted-foreground text-sm">
                          Chamber: <strong className="text-foreground">{selectedChamber}</strong>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Stage 1: Chambers list */}
                  {locationStage === 'chambers' && (
                    <>
                      {chambersSorted.length === 0 ? (
                        <p className="font-custom text-muted-foreground text-sm">
                          No chamber data in incoming orders.
                        </p>
                      ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {chambersSorted.map((chamber) => {
                            const entries = byChamber[chamber] ?? [];
                            return (
                              <Card
                                key={chamber}
                                className="cursor-pointer overflow-hidden transition-colors hover:border-primary/50 hover:bg-muted/30"
                                onClick={() => handleChamberClick(chamber)}
                              >
                                <CardHeader className="flex flex-row items-center gap-2 py-3">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="font-custom font-semibold truncate">
                                      {chamber}
                                    </p>
                                    <p className="font-custom text-muted-foreground text-xs">
                                      {entries.length} order
                                      {entries.length !== 1 ? 's' : ''} ·{' '}
                                      <span className="font-medium text-foreground">
                                        {chamberTotals[chamber]?.toLocaleString() ?? 0} {quantityLabel.toLowerCase()}
                                      </span>
                                      {' '}· Select to view floors
                                    </p>
                                  </div>
                                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                                </CardHeader>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}

                  {/* Stage 2: Floors (select then view orders) */}
                  {locationStage === 'floors' && selectedChamber && (
                    <Card className="overflow-hidden">
                      <CardHeader className="bg-muted/50 py-3">
                        <div className="flex items-center gap-2 font-custom font-semibold">
                          <Layers className="h-4 w-4 text-muted-foreground" />
                          Floors in {selectedChamber}
                        </div>
                        <p className="font-custom text-muted-foreground text-xs">
                          Select one or more floors, then click View orders. Totals shown are {quantityLabel.toLowerCase()} quantity.
                        </p>
                        <p className="font-custom text-sm font-medium text-foreground mt-1">
                          Chamber total: {(chamberTotals[selectedChamber] ?? 0).toLocaleString()} {quantityLabel.toLowerCase()}
                        </p>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="location-select-all-floors"
                              checked={
                                floorsInChamber.length > 0 &&
                                selectedFloors.length === floorsInChamber.length
                              }
                              onCheckedChange={handleSelectAllFloors}
                            />
                            <label
                              htmlFor="location-select-all-floors"
                              className="font-custom text-sm font-medium cursor-pointer"
                            >
                              Select all floors
                            </label>
                          </div>
                          <div className="flex flex-wrap gap-4">
                            {floorsInChamber.map((floor) => (
                              <div
                                key={floor}
                                className="flex items-center gap-2"
                              >
                                <Checkbox
                                  id={`location-floor-${floor}`}
                                  checked={selectedFloors.includes(floor)}
                                  onCheckedChange={(checked) =>
                                    handleFloorToggle(floor, checked === true)
                                  }
                                />
                                <label
                                  htmlFor={`location-floor-${floor}`}
                                  className="font-custom text-sm cursor-pointer"
                                >
                                  {floor}
                                  <span className="text-muted-foreground font-normal ml-1">
                                    — {(floorTotals[floor] ?? 0).toLocaleString()} {quantityLabel.toLowerCase()}
                                  </span>
                                </label>
                              </div>
                            ))}
                          </div>
                          <Button
                            className="mt-2 w-fit"
                            disabled={selectedFloors.length === 0}
                            onClick={handleViewOrders}
                          >
                            View orders
                            {selectedFloors.length > 0 &&
                              ` (${selectedFloors.length} floor${selectedFloors.length !== 1 ? 's' : ''})`}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Stage 3: Orders and their rows (table) */}
                  {locationStage === 'orders' && selectedChamber && (
                    <Card className="overflow-hidden">
                      <CardHeader className="bg-muted/50 py-3">
                        <div className="font-custom font-semibold">
                          Orders in {selectedChamber}
                          {selectedFloors.length > 0 && (
                            <span className="text-muted-foreground font-normal">
                              {' '}
                              · Floors: {selectedFloors.join(', ')}
                            </span>
                          )}
                        </div>
                        <p className="font-custom text-muted-foreground text-xs">
                          {orderRows.length} row
                          {orderRows.length !== 1 ? 's' : ''} (order × location)
                        </p>
                      </CardHeader>
                      <CardContent className="p-0">
                        {orderRows.length === 0 ? (
                          <p className="font-custom text-muted-foreground px-4 py-6 text-sm">
                            No orders for the selected floors.
                          </p>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="font-custom">IGP #</TableHead>
                                <TableHead className="font-custom">Date</TableHead>
                                <TableHead className="font-custom">Variety</TableHead>
                                <TableHead className="font-custom">Farmer</TableHead>
                                <TableHead className="font-custom">Row</TableHead>
                                <TableHead className="font-custom">Bag</TableHead>
                                <TableHead className="font-custom text-right">{quantityLabel} qty</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {orderRows.map(({ pass, bag }, idx) => (
                                <TableRow key={`${pass._id}-${bag.name}-${bag.location?.row ?? ''}-${idx}`}>
                                  <TableCell className="font-custom font-medium">
                                    {pass.gatePassNo}
                                  </TableCell>
                                  <TableCell className="font-custom text-muted-foreground">
                                    {format(new Date(pass.date), 'dd MMM yyyy')}
                                  </TableCell>
                                  <TableCell className="font-custom">
                                    {pass.variety}
                                  </TableCell>
                                  <TableCell className="font-custom">
                                    {pass.farmerStorageLinkId?.farmerId?.name ?? '—'}
                                  </TableCell>
                                  <TableCell className="font-custom">
                                    {bag.location?.row ?? '—'}
                                  </TableCell>
                                  <TableCell className="font-custom">
                                    <span className="inline-flex items-center gap-1">
                                      <Package className="h-3 w-3" />
                                      {bag.name}
                                    </span>
                                  </TableCell>
                                  <TableCell className="font-custom text-right">
                                    {getQuantity(bag)}
                                    <span className="text-muted-foreground ml-1">
                                      (of {quantityView === 'current' ? bag.initialQuantity : bag.currentQuantity})
                                    </span>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="farmer" className="mt-4">
                <div className="space-y-6">
                  {farmersSorted.length === 0 ? (
                    <p className="font-custom text-muted-foreground text-sm">
                      No farmer data in incoming orders.
                    </p>
                  ) : (
                    farmersSorted.map(([farmerId, passes]) => {
                      const farmerName =
                        passes[0]?.farmerStorageLinkId?.farmerId?.name ??
                        'Unknown';
                      const accountNumber =
                        passes[0]?.farmerStorageLinkId?.accountNumber;
                      return (
                        <Card key={farmerId} className="overflow-hidden">
                          <CardHeader className="bg-muted/50 py-3">
                            <div className="flex items-center gap-2 font-custom font-semibold">
                              <User className="h-4 w-4 text-muted-foreground" />
                              {farmerName}
                              {accountNumber != null && (
                                <span className="font-custom text-muted-foreground font-normal">
                                  (Account #{accountNumber})
                                </span>
                              )}
                            </div>
                            <p className="font-custom text-muted-foreground text-xs">
                              {passes.length} incoming order
                              {passes.length !== 1 ? 's' : ''}
                            </p>
                          </CardHeader>
                          <CardContent className="p-0">
                            <ul className="divide-y">
                              {passes.map((pass: IncomingGatePass) => (
                                <li
                                  key={pass._id}
                                  className="flex flex-col gap-2 px-4 py-3"
                                >
                                  <div className="font-custom text-sm font-medium">
                                    IGP #{pass.gatePassNo}
                                    <span className="text-muted-foreground font-normal">
                                      {' '}
                                      · {pass.variety} ·{' '}
                                      {format(
                                        new Date(pass.date),
                                        'dd MMM yyyy'
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {(pass.bagSizes ?? []).map(
                                      (bag: IncomingGatePassBagSize) => (
                                      <span
                                        key={bag.name}
                                        className="inline-flex items-center gap-1 rounded-md border bg-muted/30 px-2 py-1 font-custom text-xs"
                                      >
                                        <Package className="h-3 w-3" />
                                        {bag.name}: {getQuantity(bag)}
                                        <span className="text-muted-foreground">
                                          {' '}
                                          (of {quantityView === 'current' ? bag.initialQuantity : bag.currentQuantity})
                                        </span>
                                        {bag.location?.chamber && (
                                          <span className="text-muted-foreground">
                                            {' '}
                                            · {bag.location.chamber}
                                          </span>
                                        )}
                                      </span>
                                      )
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </TabsContent>
            </Tabs>
          );
              return (
                <Tabs
                  value={quantityView}
                  onValueChange={(v) => setQuantityView(v as QuantityView)}
                  className="mt-4"
                >
                  <TabsList variant="default" className="gap-1">
                    <TabsTrigger value="current">Current</TabsTrigger>
                    <TabsTrigger value="initial">Initial</TabsTrigger>
                  </TabsList>
                  <TabsContent value="current" className="mt-3">
                    {innerLocationFarmerTabs}
                  </TabsContent>
                  <TabsContent value="initial" className="mt-3">
                    {innerLocationFarmerTabs}
                  </TabsContent>
                </Tabs>
              );
            })()
          ) : null}
        </div>
      </div>
    </main>
  );
};

export default AdvancedAnalyticsPage;
