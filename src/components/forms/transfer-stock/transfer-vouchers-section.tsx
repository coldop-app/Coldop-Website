import { memo, useCallback, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowDown,
  ArrowUp,
  Columns,
  MapPin,
  Package,
  RotateCcw,
} from 'lucide-react';

import { useGetIncomingGatePassesOfSingleFarmer } from '@/services/incoming-gate-pass/useGetIncomingGatePassesOfSingleFarmer';
import type { IncomingGatePassItem } from '@/services/incoming-gate-pass/useGetIncomingGatePassesOfSingleFarmer';
import {
  allocationKey,
  getBagDetailsForSize,
  getUniqueLocationValues,
  groupIncomingPassesByDate,
  parseAllocationKey,
  passMatchesLocationFilters,
  type LocationFilters,
} from '@/components/forms/outgoing/outgoing-form-utils';
import { OutgoingVouchersTable } from '@/components/forms/outgoing/outgoing-vouchers-table';

function getUniqueVarieties(passes: IncomingGatePassItem[]): string[] {
  const names = new Set<string>();
  for (const p of passes) {
    const v = p.variety?.trim();
    if (v) names.add(v);
  }
  return [...names].sort();
}

function getUniqueSizes(passes: IncomingGatePassItem[]): string[] {
  const names = new Set<string>();
  for (const p of passes) {
    for (const bag of p.bagSizes ?? []) {
      if (bag?.name?.trim()) names.add(bag.name.trim());
    }
  }
  return [...names].sort();
}

export interface TransferVouchersSectionProps {
  farmerStorageLinkId: string;
  cellQuantities: Record<string, number>;
  setCellQuantities: React.Dispatch<
    React.SetStateAction<Record<string, number>>
  >;
}

export const TransferVouchersSection = memo(function TransferVouchersSection({
  farmerStorageLinkId,
  cellQuantities,
  setCellQuantities,
}: TransferVouchersSectionProps) {
  const {
    data: allPasses = [],
    isLoading,
    error,
  } = useGetIncomingGatePassesOfSingleFarmer(farmerStorageLinkId);

  const [voucherSort, setVoucherSort] = useState<'asc' | 'desc'>('asc');
  const [varietyFilter, setVarietyFilter] = useState('');
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    () => new Set()
  );
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(
    () => new Set()
  );
  const [locationFilters, setLocationFilters] = useState<LocationFilters>({
    chamber: '',
    floor: '',
    row: '',
  });

  const filteredAndSortedPasses = useMemo(() => {
    let list = allPasses;
    if (varietyFilter.trim()) {
      list = list.filter((p) => p.variety?.trim() === varietyFilter);
    }
    list = list.filter((p) => passMatchesLocationFilters(p, locationFilters));
    return [...list].sort((a, b) => {
      const na = a.gatePassNo ?? 0;
      const nb = b.gatePassNo ?? 0;
      return voucherSort === 'asc' ? na - nb : nb - na;
    });
  }, [allPasses, varietyFilter, voucherSort, locationFilters]);

  const uniqueLocations = useMemo(
    () => getUniqueLocationValues(allPasses),
    [allPasses]
  );

  const uniqueVarieties = useMemo(
    () => getUniqueVarieties(allPasses),
    [allPasses]
  );

  const tableSizes = useMemo(
    () => getUniqueSizes(filteredAndSortedPasses),
    [filteredAndSortedPasses]
  );

  const allTableSizes = useMemo(() => getUniqueSizes(allPasses), [allPasses]);

  const visibleSizes = useMemo(() => {
    if (visibleColumns.size === 0 && tableSizes.length > 0) return tableSizes;
    return tableSizes.filter((s) => visibleColumns.has(s));
  }, [tableSizes, visibleColumns]);

  const handleColumnToggle = useCallback((size: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(size)) next.delete(size);
      else next.add(size);
      return next;
    });
  }, []);

  const handleResetFilters = useCallback(() => {
    setVoucherSort('asc');
    setVarietyFilter('');
    setLocationFilters({ chamber: '', floor: '', row: '' });
    setVisibleColumns(new Set());
    setSelectedOrders(new Set());
    setCellQuantities({});
  }, [setCellQuantities]);

  const handleCellQuantityChange = useCallback(
    (
      passId: string,
      sizeName: string,
      quantity: number,
      bagIndex: number = 0
    ) => {
      setCellQuantities((prev) => ({
        ...prev,
        [allocationKey(passId, sizeName, bagIndex)]: quantity,
      }));
    },
    [setCellQuantities]
  );

  const handleCellQuickRemove = useCallback(
    (passId: string, sizeName: string, bagIndex: number = 0) => {
      setCellQuantities((prev) => {
        const next = { ...prev };
        delete next[allocationKey(passId, sizeName, bagIndex)];
        return next;
      });
    },
    [setCellQuantities]
  );

  const displayGroups = useMemo(
    () => groupIncomingPassesByDate(filteredAndSortedPasses, voucherSort),
    [filteredAndSortedPasses, voucherSort]
  );

  const handleOrderToggle = useCallback(
    (passId: string) => {
      const isSelecting = !selectedOrders.has(passId);
      setSelectedOrders((prev) => {
        const next = new Set(prev);
        if (isSelecting) next.add(passId);
        else next.delete(passId);
        return next;
      });
      if (isSelecting) {
        const pass = displayGroups
          .flatMap((g) => g.passes)
          .find((p) => p._id === passId);
        if (pass) {
          setCellQuantities((prev) => {
            const next = { ...prev };
            for (const size of visibleSizes) {
              const details = getBagDetailsForSize(pass, size);
              for (const detail of details) {
                if (detail.currentQuantity > 0) {
                  next[allocationKey(passId, size, detail.bagIndex)] =
                    detail.currentQuantity;
                }
              }
            }
            return next;
          });
        }
      } else {
        setCellQuantities((prev) => {
          const next = { ...prev };
          for (const key of Object.keys(next)) {
            const parsed = parseAllocationKey(key);
            if (parsed?.passId === passId) delete next[key];
          }
          return next;
        });
      }
    },
    [selectedOrders, displayGroups, visibleSizes, setCellQuantities]
  );

  if (!farmerStorageLinkId) {
    return (
      <p className="font-custom text-muted-foreground text-sm">
        Select a farmer to view their incoming gate passes.
      </p>
    );
  }

  if (isLoading) {
    return (
      <p className="font-custom text-muted-foreground text-sm">
        Loading gate passes...
      </p>
    );
  }

  if (error) {
    return (
      <p className="font-custom text-destructive text-sm">
        Failed to load gate passes: {error.message}
      </p>
    );
  }

  if (!allPasses.length) {
    return (
      <p className="font-custom text-muted-foreground text-sm">
        No incoming gate passes for this farmer.
      </p>
    );
  }

  const hasGradingData = allPasses.length > 0;
  const hasFilteredData =
    filteredAndSortedPasses.length > 0 && tableSizes.length > 0;
  const hasActiveFilters =
    varietyFilter.trim() !== '' ||
    locationFilters.chamber !== '' ||
    locationFilters.floor !== '' ||
    locationFilters.row !== '';

  const sizesForColumnPicker =
    tableSizes.length > 0 ? tableSizes : allTableSizes;

  const requireVarietySelection =
    uniqueVarieties.length > 0 && !varietyFilter.trim();

  return (
    <div className="space-y-3">
      {hasGradingData && (
        <div className="border-border/60 bg-muted/30 flex flex-wrap items-end gap-x-5 gap-y-4 rounded-xl border px-4 py-4 shadow-sm">
          <div className="flex flex-col gap-2">
            <span className="font-custom text-muted-foreground text-xs leading-none font-medium">
              Sort by gate pass
            </span>
            <div className="flex h-10 items-center gap-1.5">
              <Button
                type="button"
                variant={voucherSort === 'asc' ? 'default' : 'outline'}
                size="sm"
                className="font-custom h-10 gap-1.5 px-3"
                onClick={() => setVoucherSort('asc')}
              >
                <ArrowUp className="h-4 w-4" />
                Ascending
              </Button>
              <Button
                type="button"
                variant={voucherSort === 'desc' ? 'default' : 'outline'}
                size="sm"
                className="font-custom h-10 gap-1.5 px-3"
                onClick={() => setVoucherSort('desc')}
              >
                <ArrowDown className="h-4 w-4" />
                Descending
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="font-custom gap-2"
                >
                  <Columns className="h-4 w-4" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="font-custom">
                  Toggle size columns
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {sizesForColumnPicker.map((size) => (
                  <DropdownMenuCheckboxItem
                    key={size}
                    checked={visibleColumns.has(size)}
                    onCheckedChange={() => handleColumnToggle(size)}
                    className="font-custom"
                  >
                    {size}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {uniqueVarieties.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="font-custom text-muted-foreground text-xs leading-none font-medium">
                Variety
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="font-custom h-10 min-w-[100px] justify-between gap-2"
                  >
                    <Package className="h-4 w-4 shrink-0" />
                    {varietyFilter || 'All'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuRadioGroup
                    value={varietyFilter}
                    onValueChange={(v) => setVarietyFilter(v ?? '')}
                  >
                    <DropdownMenuRadioItem value="" className="font-custom">
                      All
                    </DropdownMenuRadioItem>
                    {uniqueVarieties.map((v) => (
                      <DropdownMenuRadioItem
                        key={v}
                        value={v}
                        className="font-custom"
                      >
                        {v}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          {(uniqueLocations.chambers.length > 0 ||
            uniqueLocations.floors.length > 0 ||
            uniqueLocations.rows.length > 0) && (
            <>
              {uniqueLocations.chambers.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="font-custom text-muted-foreground text-xs leading-none font-medium">
                    Chamber
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="font-custom h-10 min-w-[100px] justify-between gap-2"
                      >
                        <MapPin className="h-4 w-4 shrink-0" />
                        {locationFilters.chamber || 'All'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      <DropdownMenuRadioGroup
                        value={locationFilters.chamber}
                        onValueChange={(v) =>
                          setLocationFilters((prev) => ({
                            ...prev,
                            chamber: v ?? '',
                          }))
                        }
                      >
                        <DropdownMenuRadioItem value="" className="font-custom">
                          All
                        </DropdownMenuRadioItem>
                        {uniqueLocations.chambers.map((c) => (
                          <DropdownMenuRadioItem
                            key={c}
                            value={c}
                            className="font-custom"
                          >
                            {c}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
              {uniqueLocations.floors.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="font-custom text-muted-foreground text-xs leading-none font-medium">
                    Floor
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="font-custom h-10 min-w-[100px] justify-between gap-2"
                      >
                        <MapPin className="h-4 w-4 shrink-0" />
                        {locationFilters.floor || 'All'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      <DropdownMenuRadioGroup
                        value={locationFilters.floor}
                        onValueChange={(v) =>
                          setLocationFilters((prev) => ({
                            ...prev,
                            floor: v ?? '',
                          }))
                        }
                      >
                        <DropdownMenuRadioItem value="" className="font-custom">
                          All
                        </DropdownMenuRadioItem>
                        {uniqueLocations.floors.map((f) => (
                          <DropdownMenuRadioItem
                            key={f}
                            value={f}
                            className="font-custom"
                          >
                            {f}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
              {uniqueLocations.rows.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="font-custom text-muted-foreground text-xs leading-none font-medium">
                    Row
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="font-custom h-10 min-w-[100px] justify-between gap-2"
                      >
                        <MapPin className="h-4 w-4 shrink-0" />
                        {locationFilters.row || 'All'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      <DropdownMenuRadioGroup
                        value={locationFilters.row}
                        onValueChange={(v) =>
                          setLocationFilters((prev) => ({
                            ...prev,
                            row: v ?? '',
                          }))
                        }
                      >
                        <DropdownMenuRadioItem value="" className="font-custom">
                          All
                        </DropdownMenuRadioItem>
                        {uniqueLocations.rows.map((r) => (
                          <DropdownMenuRadioItem
                            key={r}
                            value={r}
                            className="font-custom"
                          >
                            {r}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </>
          )}
          <div className="flex flex-col gap-2">
            <span className="font-custom text-muted-foreground text-xs leading-none font-medium">
              Reset
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="font-custom gap-2"
              onClick={handleResetFilters}
            >
              <RotateCcw className="h-4 w-4" />
              Reset filters
            </Button>
          </div>
        </div>
      )}
      {requireVarietySelection ? (
        <p className="font-custom text-muted-foreground text-sm">
          Please select a variety from the dropdown above to view incoming gate
          passes.
        </p>
      ) : (
        <OutgoingVouchersTable
          displayGroups={displayGroups}
          visibleSizes={visibleSizes}
          selectedOrders={selectedOrders}
          onOrderToggle={handleOrderToggle}
          cellRemovedQuantities={cellQuantities}
          onCellQuantityChange={handleCellQuantityChange}
          onCellQuickRemove={handleCellQuickRemove}
          isLoadingPasses={isLoading}
          hasGradingData={hasGradingData}
          hasFilteredData={hasFilteredData}
          hasActiveFilters={hasActiveFilters}
        />
      )}
    </div>
  );
});

