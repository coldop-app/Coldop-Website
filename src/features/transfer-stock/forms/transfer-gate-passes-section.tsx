import { useState, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Columns,
  Filter,
  MapPin,
  Package,
  RotateCcw,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { TransferGatePassMatrix } from '@/features/transfer-stock/forms/transfer-gate-pass-matrix';
import { useStorageGatePassesForFarmer } from '@/features/transfer-stock/hooks/use-storage-gate-passes-for-farmer';
import { useTransferGatePassMatrix } from '@/features/transfer-stock/hooks/use-transfer-gate-pass-matrix';
import type { VarietyFilterMode } from '@/features/transfer-stock/hooks/use-transfer-gate-pass-matrix';
import type { StorageGatePass } from '@/features/transfer-stock/types/storage-gate-pass';
import { cn } from '@/lib/utils';

type TransferGatePassesSectionProps = {
  fromFarmerStorageLinkId: string;
  allocations: Record<string, number>;
  onAllocationsChange: (next: Record<string, number>) => void;
  farmerPromptLabel?: string;
  varietyFilterMode?: VarietyFilterMode;
  allocationMode?: 'create' | 'edit';
  baselineAllocations?: Record<string, number>;
  passesOverride?: StorageGatePass[];
  passesLoading?: boolean;
  passesError?: Error | null;
  /** When set, locks the matrix to this stock filter (hides stock filter dropdown). */
  stockFilter?: string;
  initialVariety?: string;
  toolbarVariant?: 'default' | 'stacked';
};

export function TransferGatePassesSection({
  fromFarmerStorageLinkId,
  allocations,
  onAllocationsChange,
  farmerPromptLabel = 'From',
  varietyFilterMode = 'single-required',
  allocationMode = 'create',
  baselineAllocations = {},
  passesOverride,
  passesLoading: passesLoadingOverride,
  passesError: passesErrorOverride,
  stockFilter,
  initialVariety,
  toolbarVariant = 'default',
}: TransferGatePassesSectionProps) {
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const hookResult = useStorageGatePassesForFarmer(
    passesOverride != null ? '' : fromFarmerStorageLinkId,
  );

  const allPasses = passesOverride ?? hookResult.data;
  const isLoading = passesLoadingOverride ?? hookResult.isLoading;
  const error = passesErrorOverride ?? hookResult.error;

  const matrix = useTransferGatePassMatrix({
    allPasses,
    allocations,
    onAllocationsChange,
    varietyFilterMode,
    stockFilter,
    initialVariety,
  });

  if (!fromFarmerStorageLinkId) {
    return (
      <GatePassesSectionMessage
        title="Select a farmer"
        description={
          <>
            Choose a <span className="text-foreground font-medium">{farmerPromptLabel}</span> farmer
            to view incoming gate passes.
          </>
        }
      />
    );
  }

  if (isLoading) {
    return (
      <Card size="sm" className="ring-border/60 py-4">
        <CardContent className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <GatePassesSectionMessage
        title="Could not load gate passes"
        description={error.message}
        variant="destructive"
      />
    );
  }

  if (!allPasses.length) {
    return (
      <GatePassesSectionMessage
        title="No gate passes"
        description="No incoming gate passes for this farmer."
      />
    );
  }

  return (
    <div className="min-w-0 space-y-3 sm:space-y-4">
      <div
        className={cn(
          'min-w-0 space-y-3 sm:space-y-4',
          toolbarVariant === 'stacked' &&
            'border-border bg-card space-y-0 overflow-hidden rounded-xl border shadow-sm sm:space-y-0',
        )}
      >
        <div className={cn(toolbarVariant === 'stacked' && 'px-4 pt-4 pb-2 sm:p-4 sm:pb-3')}>
          <InputGroup className="h-10 sm:h-11">
            <InputGroupAddon align="inline-start">
              <Search className="size-4" aria-hidden />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search by gate pass, manual parchi, or lot number"
              value={matrix.gatePassSearch}
              onChange={(e) => matrix.setGatePassSearch(e.target.value)}
              className="text-base sm:text-sm"
              aria-label="Search gate passes by voucher, manual parchi, or lot number"
            />
          </InputGroup>
        </div>

        <Card
          size="sm"
          className={cn(
            'bg-muted/30 ring-border/60 min-w-0 overflow-hidden py-0',
            toolbarVariant === 'stacked' &&
              'bg-muted/15 gap-0 rounded-none border-x-0 border-b-0 shadow-none ring-0',
          )}
        >
          <CardContent
            className={cn(
              'flex items-end gap-2 overflow-x-auto px-3 py-3 sm:flex-wrap sm:gap-x-5 sm:gap-y-4 sm:overflow-visible sm:px-4 sm:py-4',
              toolbarVariant === 'stacked' &&
                'grid grid-cols-2 items-stretch gap-x-3 gap-y-3 overflow-visible px-4 pt-2 pb-4 sm:flex sm:items-end sm:pt-3 [&>div]:min-w-0 [&>div>button]:w-full',
            )}
          >
            <div
              className={cn(
                'flex shrink-0 flex-col gap-1.5 sm:gap-2',
                toolbarVariant === 'stacked' && 'order-2',
              )}
            >
              <Label
                className={cn(
                  'text-xs leading-none font-medium',
                  toolbarVariant === 'stacked'
                    ? 'text-primary/80'
                    : 'text-muted-foreground sr-only sm:not-sr-only',
                )}
              >
                Bag sizes
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      'h-9 gap-2 sm:h-10',
                      toolbarVariant === 'stacked' &&
                        'border-primary/30 bg-primary/5 hover:bg-primary/10',
                    )}
                  >
                    <Columns className="size-4" />
                    Sizes
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Toggle sizes</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={matrix.sizeVisibility === 'all'}
                    onCheckedChange={(checked) => {
                      if (checked) matrix.handleSelectAllSizes();
                      else matrix.setSizeVisibility(new Set());
                    }}
                  >
                    All
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator />
                  {matrix.sizesForColumnPicker.map((size) => (
                    <DropdownMenuCheckboxItem
                      key={size}
                      checked={matrix.isSizeVisible(matrix.sizeVisibility, size)}
                      onCheckedChange={() => matrix.handleSizeToggle(size)}
                    >
                      {size}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {matrix.uniqueVarieties.length > 0 &&
              (matrix.varietyFilterMode === 'multi-optional' ? (
                <div
                  className={cn(
                    'flex shrink-0 flex-col gap-1.5 sm:gap-2',
                    toolbarVariant === 'stacked' && 'order-1',
                  )}
                >
                  <Label
                    className={cn(
                      'text-xs leading-none font-medium',
                      toolbarVariant === 'stacked'
                        ? 'text-primary/80'
                        : 'text-muted-foreground sr-only sm:not-sr-only',
                    )}
                  >
                    Varieties
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className={cn(
                          'h-9 max-w-44 gap-2 sm:h-10 sm:max-w-56',
                          toolbarVariant === 'stacked' &&
                            'border-primary/30 bg-primary/5 hover:bg-primary/10',
                        )}
                        title={matrix.varietyVisibilityLabel}
                        aria-label={`Varieties: ${matrix.varietyVisibilityLabel}`}
                      >
                        <Package className="size-4 shrink-0" />
                        <span className="truncate">{matrix.varietyVisibilityLabel}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Toggle varieties</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuCheckboxItem
                        checked={matrix.varietyVisibility === 'all'}
                        onCheckedChange={(checked) => {
                          if (checked) matrix.handleSelectAllVarieties();
                          else matrix.setVarietyVisibility(new Set());
                        }}
                      >
                        All
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuSeparator />
                      {matrix.uniqueVarieties.map((variety) => (
                        <DropdownMenuCheckboxItem
                          key={variety}
                          checked={matrix.isVarietyVisible(matrix.varietyVisibility, variety)}
                          onCheckedChange={() => matrix.handleVarietyToggle(variety)}
                        >
                          {variety}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div
                  className={cn(
                    'flex shrink-0 flex-col gap-1.5 rounded-lg transition-[box-shadow,background-color,border-color] sm:gap-2',
                    toolbarVariant === 'stacked' && 'order-1',
                    matrix.needsVarietySelection &&
                      'border-primary/50 bg-primary/5 ring-primary/25 border-2 p-2.5 shadow-sm ring-2',
                  )}
                >
                  <div className="flex flex-col gap-0.5">
                    <Label
                      className={cn(
                        'text-xs leading-none font-medium',
                        matrix.needsVarietySelection ? 'text-primary' : 'text-muted-foreground',
                      )}
                    >
                      Variety
                      {matrix.needsVarietySelection ? (
                        <span className="text-destructive ml-0.5 font-semibold">*</span>
                      ) : null}
                    </Label>
                    {matrix.needsVarietySelection ? (
                      <p className="text-muted-foreground max-w-52 text-xs leading-snug">
                        Choose a variety to show gate passes below.
                      </p>
                    ) : null}
                  </div>
                  <MatrixRadioFilter
                    value={matrix.varietyFilter}
                    options={matrix.uniqueVarieties}
                    onChange={matrix.setVarietyFilter}
                    icon={Package}
                    triggerClassName={cn(
                      'min-w-[120px]',
                      matrix.needsVarietySelection &&
                        'border-primary/60 bg-background text-primary hover:bg-primary/10',
                    )}
                    ariaLabel={
                      matrix.needsVarietySelection ? 'Variety — required' : 'Variety filter'
                    }
                  />
                </div>
              ))}

            {toolbarVariant === 'stacked' ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="bg-background/70 text-foreground/90 hover:bg-background order-3 col-span-2 h-10 w-full justify-between border-dashed px-4 shadow-none sm:hidden"
                aria-expanded={showMoreFilters}
                onClick={() => setShowMoreFilters((visible) => !visible)}
              >
                {showMoreFilters ? 'Hide more filters' : 'Show more filters'}
                <ChevronDown
                  className={cn('size-4 transition-transform', showMoreFilters && 'rotate-180')}
                />
              </Button>
            ) : null}

            <div
              className={cn(
                'contents',
                toolbarVariant === 'stacked' && !showMoreFilters && 'hidden sm:contents',
                toolbarVariant === 'stacked' &&
                  showMoreFilters &&
                  'bg-background/60 order-4 col-span-2 grid grid-cols-2 gap-x-3 gap-y-3 rounded-xl border p-3 sm:contents [&>div]:min-w-0 [&>div>button]:w-full',
              )}
            >
              <div className="order-first flex shrink-0 flex-col gap-1.5 sm:gap-2">
                <Label
                  className={cn(
                    'text-muted-foreground text-xs leading-none font-medium',
                    toolbarVariant !== 'stacked' && 'sr-only sm:not-sr-only',
                  )}
                >
                  Sort by gate pass
                </Label>
                {toolbarVariant === 'stacked' ? (
                  <Select
                    value={matrix.voucherSort}
                    onValueChange={(value) => matrix.setVoucherSort(value as 'asc' | 'desc')}
                  >
                    <SelectTrigger className="h-9 w-full sm:h-10 sm:w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex h-9 items-center gap-1.5 sm:h-10">
                    <Button
                      type="button"
                      variant={matrix.voucherSort === 'asc' ? 'default' : 'outline'}
                      size="sm"
                      className="h-9 gap-1.5 px-3 sm:h-10"
                      onClick={() => matrix.setVoucherSort('asc')}
                    >
                      <ArrowUp className="size-4" />
                      <span className="sm:hidden">Asc</span>
                      <span className="hidden sm:inline">Ascending</span>
                    </Button>
                    <Button
                      type="button"
                      variant={matrix.voucherSort === 'desc' ? 'default' : 'outline'}
                      size="sm"
                      className="h-9 gap-1.5 px-3 sm:h-10"
                      onClick={() => matrix.setVoucherSort('desc')}
                    >
                      <ArrowDown className="size-4" />
                      <span className="sm:hidden">Desc</span>
                      <span className="hidden sm:inline">Descending</span>
                    </Button>
                  </div>
                )}
              </div>

              {matrix.showStockFilter && matrix.stockFilterOptions.length > 0 && (
                <MatrixRadioFilter
                  label="Stock filter"
                  value={matrix.stockFilterFilter}
                  options={matrix.stockFilterOptions}
                  onChange={matrix.setStockFilterFilter}
                  icon={Filter}
                  ariaLabel="Stock filter"
                  showLabel={toolbarVariant === 'stacked'}
                  groupClassName={toolbarVariant === 'stacked' ? 'order-3' : undefined}
                />
              )}

              {matrix.uniqueLocations.chambers.length > 0 && (
                <MatrixRadioFilter
                  label="Chamber"
                  value={matrix.locationFilters.chamber}
                  options={matrix.uniqueLocations.chambers}
                  onChange={(chamber) =>
                    matrix.setLocationFilters((prev) => ({ ...prev, chamber }))
                  }
                  icon={MapPin}
                  showLabel={toolbarVariant === 'stacked'}
                  groupClassName={toolbarVariant === 'stacked' ? 'order-3' : undefined}
                />
              )}
              {matrix.uniqueLocations.floors.length > 0 && (
                <MatrixRadioFilter
                  label="Floor"
                  value={matrix.locationFilters.floor}
                  options={matrix.uniqueLocations.floors}
                  onChange={(floor) => matrix.setLocationFilters((prev) => ({ ...prev, floor }))}
                  icon={MapPin}
                  showLabel={toolbarVariant === 'stacked'}
                  groupClassName={toolbarVariant === 'stacked' ? 'order-3' : undefined}
                />
              )}
              {matrix.uniqueLocations.rows.length > 0 && (
                <MatrixRadioFilter
                  label="Row"
                  value={matrix.locationFilters.row}
                  options={matrix.uniqueLocations.rows}
                  onChange={(row) => matrix.setLocationFilters((prev) => ({ ...prev, row }))}
                  icon={MapPin}
                  showLabel={toolbarVariant === 'stacked'}
                  groupClassName={toolbarVariant === 'stacked' ? 'order-3' : undefined}
                />
              )}

              <div
                className={cn(
                  'flex shrink-0 flex-col gap-1.5 sm:gap-2',
                  toolbarVariant === 'stacked' && 'order-3',
                )}
              >
                <Label
                  className={cn(
                    'text-muted-foreground text-xs leading-none font-medium',
                    toolbarVariant !== 'stacked' && 'sr-only sm:not-sr-only',
                  )}
                >
                  Reset
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 gap-2 sm:h-10"
                  onClick={matrix.handleResetFilters}
                >
                  <RotateCcw className="size-4" />
                  Reset filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <TransferGatePassMatrix
        displayGroups={matrix.displayGroups}
        visibleSizes={matrix.visibleSizes}
        selectedPassIds={matrix.selectedPassIds}
        onPassToggle={matrix.handlePassToggle}
        allocations={allocations}
        onAllocationChange={matrix.handleAllocationChange}
        onAllocationClear={matrix.handleAllocationClear}
        hasFilteredData={matrix.hasFilteredData}
        hasActiveFilters={matrix.hasActiveFilters}
        varietyFilterMode={matrix.varietyFilterMode}
        allocationMode={allocationMode}
        baselineAllocations={baselineAllocations}
      />
    </div>
  );
}

function GatePassesSectionMessage({
  title,
  description,
  variant = 'default',
}: {
  title: string;
  description: ReactNode;
  variant?: 'default' | 'destructive';
}) {
  return (
    <Card size="sm" className="ring-border/60 py-0">
      <CardContent className="px-0 py-0">
        <Empty className="border-0 py-10">
          <EmptyHeader>
            <EmptyTitle className={variant === 'destructive' ? 'text-destructive' : undefined}>
              {title}
            </EmptyTitle>
            <EmptyDescription>{description}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </CardContent>
    </Card>
  );
}

function MatrixRadioFilter({
  label,
  value,
  options,
  onChange,
  icon: Icon,
  triggerClassName,
  ariaLabel,
  showLabel = false,
  groupClassName,
}: {
  label?: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  icon?: LucideIcon;
  triggerClassName?: string;
  ariaLabel?: string;
  showLabel?: boolean;
  groupClassName?: string;
}) {
  return (
    <div className={cn('flex shrink-0 flex-col gap-1.5 sm:gap-2', groupClassName)}>
      {label ? (
        <Label
          className={cn(
            'text-muted-foreground text-xs leading-none font-medium',
            !showLabel && 'sr-only sm:not-sr-only',
          )}
        >
          {label}
        </Label>
      ) : null}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn('h-9 min-w-[100px] justify-between gap-2 sm:h-10', triggerClassName)}
            aria-label={ariaLabel ?? `${label} filter`}
          >
            {Icon ? <Icon className="size-4 shrink-0" /> : null}
            {value || 'All'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(v ?? '')}>
            <DropdownMenuRadioItem value="">All</DropdownMenuRadioItem>
            {options.map((opt) => (
              <DropdownMenuRadioItem key={opt} value={opt}>
                {opt}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
