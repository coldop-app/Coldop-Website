import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SearchSelector,
  type Option,
} from '@/components/forms/search-selector';
import { AddFarmerModal } from '@/components/forms/add-farmer-modal';
import { useGetAllFarmers } from '@/services/store-admin/functions/useGetAllFarmers';
import { useGetReceiptVoucherNumber } from '@/services/store-admin/functions/useGetVoucherNumber';
import { useGetIncomingGatePassesOfSingleFarmer } from '@/services/incoming-gate-pass/useGetIncomingGatePassesOfSingleFarmer';
import type { IncomingGatePassItem } from '@/services/incoming-gate-pass/useGetIncomingGatePassesOfSingleFarmer';
import { OutgoingSummarySheet } from '@/components/forms/outgoing/outgoing-summary-sheet';
import { OutgoingVouchersTable } from '@/components/forms/outgoing/outgoing-vouchers-table';
import {
  allocationKey,
  buildInitialAllocationsFromEntry,
  getBagDetailsForSize,
  getUniqueLocationValues,
  groupIncomingPassesByDate,
  parseAllocationKey,
  passMatchesLocationFilters,
  type LocationFilters,
} from '@/components/forms/outgoing/outgoing-form-utils';
import { EditOutgoingAllocations } from '@/components/forms/outgoing/edit-outgoing-allocations';
import { DatePicker } from '@/components/forms/date-picker';
import { formatDate, payloadDateSchema } from '@/lib/helpers';
import {
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import {
  ArrowDown,
  ArrowUp,
  Columns,
  MapPin,
  Package,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useCreateOutgoingGatePass,
  type CreateOutgoingGatePassBody,
} from '@/services/outgoing-gate-pass/useCreateOutgoingGatePass';
import type { DaybookEntry } from '@/services/store-admin/functions/useGetDaybook';

type FieldErrors = Array<{ message?: string } | undefined>;

export interface OutgoingFormProps {
  editEntry?: DaybookEntry;
  editId?: string;
}

/** Unique variety names from incoming gate passes (for filter dropdown). */
function getUniqueVarieties(passes: IncomingGatePassItem[]): string[] {
  const names = new Set<string>();
  for (const p of passes) {
    const v = p.variety?.trim();
    if (v) names.add(v);
  }
  return [...names].sort();
}

/** Unique bag size names across all incoming gate passes */
function getUniqueSizes(passes: IncomingGatePassItem[]): string[] {
  const names = new Set<string>();
  for (const p of passes) {
    for (const bag of p.bagSizes ?? []) {
      if (bag?.name?.trim()) names.add(bag.name.trim());
    }
  }
  return [...names].sort();
}

/** Build API payload from form values and allocation map. Returns null if no allocations. */
function buildOutgoingPayload(
  formValues: {
    farmerStorageLinkId: string;
    orderDate: string;
    remarks: string;
    from?: string;
    to?: string;
    truckNumber?: string;
    manualParchiNumber?: string;
  },
  gatePassNo: number,
  cellRemovedQuantities: Record<string, number>,
  incomingPasses: IncomingGatePassItem[] = []
): CreateOutgoingGatePassBody | null {
  const entries = Object.entries(cellRemovedQuantities).filter(
    ([, qty]) => qty != null && qty > 0
  );
  if (entries.length === 0) return null;

  const passById = new Map(incomingPasses.map((p) => [p._id, p]));

  /** Per passId: list of allocations (size, quantityToAllocate, location) – one per cell. */
  const byPassAllocations = new Map<
    string,
    Array<{ size: string; quantityToAllocate: number; location: { chamber: string; floor: string; row: string } }>
  >();
  for (const [key, qty] of entries) {
    const parsed = parseAllocationKey(key);
    if (!parsed) continue;
    const { passId, sizeName, bagIndex } = parsed;
    const pass = passById.get(passId);
    if (!pass) continue;
    const details = getBagDetailsForSize(pass, sizeName);
    const detail = details[bagIndex];
    const location = detail?.location
      ? {
          chamber: detail.location.chamber ?? '',
          floor: detail.location.floor ?? '',
          row: detail.location.row ?? '',
        }
      : { chamber: '', floor: '', row: '' };
    if (!byPassAllocations.has(passId)) byPassAllocations.set(passId, []);
    byPassAllocations.get(passId)!.push({
      size: sizeName,
      quantityToAllocate: qty,
      location,
    });
  }

  const incomingGatePasses = [...byPassAllocations.entries()]
    .map(([incomingGatePassId, allocations]) => {
      const pass = passById.get(incomingGatePassId);
      const variety = pass?.variety?.trim() ?? '';
      return { incomingGatePassId, variety, allocations };
    })
    .filter((e) => e.allocations.length > 0);
  if (incomingGatePasses.length === 0) return null;

  const date = payloadDateSchema.parse(formValues.orderDate);

  const manualParchiNum =
    formValues.manualParchiNumber?.trim();
  const manualParchiNumber =
    manualParchiNum != null &&
    manualParchiNum !== '' &&
    /^\d+$/.test(manualParchiNum)
      ? Number.parseInt(manualParchiNum, 10)
      : undefined;
  const manualParchiPayload =
    manualParchiNumber != null && manualParchiNumber > 0
      ? { manualParchiNumber }
      : {};

  return {
    farmerStorageLinkId: formValues.farmerStorageLinkId,
    gatePassNo,
    date,
    ...(formValues.from?.trim() && { from: formValues.from.trim() }),
    ...(formValues.to?.trim() && { to: formValues.to.trim() }),
    ...(formValues.truckNumber?.trim() && {
      truckNumber: formValues.truckNumber.trim(),
    }),
    ...manualParchiPayload,
    incomingGatePasses,
    remarks: formValues.remarks?.trim() ?? '',
  };
}

/** Fetches data, filter/sort state, and renders OutgoingVouchersTable (grouped by date, R. Voucher + size cells) */
function OutgoingVouchersSection({
  farmerStorageLinkId,
  cellRemovedQuantities,
  setCellRemovedQuantities,
}: {
  farmerStorageLinkId: string;
  cellRemovedQuantities: Record<string, number>;
  setCellRemovedQuantities: React.Dispatch<
    React.SetStateAction<Record<string, number>>
  >;
}) {
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

  /** Sizes from all passes – used for column picker when filtered result is empty so filters stay usable. */
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
    setCellRemovedQuantities({});
  }, [setCellRemovedQuantities]);

  const handleCellQuantityChange = useCallback(
    (
      passId: string,
      sizeName: string,
      quantity: number,
      bagIndex: number = 0
    ) => {
      setCellRemovedQuantities((prev) => ({
        ...prev,
        [allocationKey(passId, sizeName, bagIndex)]: quantity,
      }));
    },
    [setCellRemovedQuantities]
  );

  const handleCellQuickRemove = useCallback(
    (passId: string, sizeName: string, bagIndex: number = 0) => {
      setCellRemovedQuantities((prev) => {
        const next = { ...prev };
        delete next[allocationKey(passId, sizeName, bagIndex)];
        return next;
      });
    },
    [setCellRemovedQuantities]
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
          setCellRemovedQuantities((prev) => {
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
        setCellRemovedQuantities((prev) => {
          const next = { ...prev };
          for (const key of Object.keys(next)) {
            const parsed = parseAllocationKey(key);
            if (parsed?.passId === passId) delete next[key];
          }
          return next;
        });
      }
    },
    [selectedOrders, displayGroups, visibleSizes, setCellRemovedQuantities]
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

      <OutgoingVouchersTable
        displayGroups={displayGroups}
        visibleSizes={visibleSizes}
        selectedOrders={selectedOrders}
        onOrderToggle={handleOrderToggle}
        cellRemovedQuantities={cellRemovedQuantities}
        onCellQuantityChange={handleCellQuantityChange}
        onCellQuickRemove={handleCellQuickRemove}
        isLoadingPasses={isLoading}
        hasGradingData={hasGradingData}
        hasFilteredData={hasFilteredData}
        hasActiveFilters={hasActiveFilters}
      />
    </div>
  );
}

const defaultOutgoingFormValues = {
  manualParchiNumber: '',
  farmerStorageLinkId: '',
  orderDate: formatDate(new Date()),
  from: '',
  to: '',
  truckNumber: '',
  remarks: '',
};

export const OutgoingForm = memo(function OutgoingForm({
  editEntry,
  editId,
}: OutgoingFormProps = {}) {
  const isEditMode = Boolean(editEntry);

  const {
    data: farmerLinks,
    isLoading: isLoadingFarmers,
    refetch: refetchFarmers,
  } = useGetAllFarmers();

  const { data: nextVoucherNumber, isLoading: isLoadingVoucher } =
    useGetReceiptVoucherNumber('outgoing');
  const voucherNumberDisplay = isEditMode
    ? editEntry?.gatePassNo != null
      ? `#${editEntry.gatePassNo}`
      : '—'
    : isLoadingVoucher
      ? '...'
      : nextVoucherNumber != null
        ? `#${nextVoucherNumber}`
        : '—';

  const createOutgoing = useCreateOutgoingGatePass();
  const [cellRemovedQuantities, setCellRemovedQuantities] = useState<
    Record<string, number>
  >({});
  const [pendingPayload, setPendingPayload] =
    useState<CreateOutgoingGatePassBody | null>(null);

  useEffect(() => {
    if (editEntry) {
      setCellRemovedQuantities(buildInitialAllocationsFromEntry(editEntry));
    }
  }, [editEntry]);

  const editDefaultValues = useMemo(() => {
    if (!editEntry) return null;
    const orderDate =
      editEntry.date != null && editEntry.date !== ''
        ? formatDate(new Date(editEntry.date))
        : formatDate(new Date());
    return {
      manualParchiNumber: editEntry.manualParchiNumber ?? '',
      farmerStorageLinkId: editEntry.farmerStorageLinkId?._id ?? '',
      orderDate,
      from: editEntry.from ?? '',
      to: editEntry.to ?? '',
      truckNumber: editEntry.truckNumber ?? '',
      remarks: editEntry.remarks ?? '',
    };
  }, [editEntry]);

  const farmerOptions: Option<string>[] = useMemo(() => {
    if (!farmerLinks) return [];
    return farmerLinks
      .filter((link) => link.isActive)
      .map((link) => ({
        value: link._id,
        label: `${link.farmerId.name} (Account #${link.accountNumber})`,
        searchableText: `${link.farmerId.name} ${link.accountNumber} ${link.farmerId.mobileNumber} ${link.farmerId.address}`,
      }));
  }, [farmerLinks]);

  const handleFarmerSelect = (value: string) => {
    form.setFieldValue('farmerStorageLinkId', value);
  };

  const handleFarmerAdded = () => {
    refetchFarmers();
  };

  const formSchema = useMemo(
    () =>
      z.object({
        manualParchiNumber: z
          .string()
          .trim()
          .optional()
          .refine(
            (v) =>
              v === undefined ||
              v === '' ||
              (/^\d+$/.test(v) && Number.parseInt(v, 10) > 0),
            'Manual parchi number must be a positive integer'
          ),
        farmerStorageLinkId: z.string().min(1, 'Please select a farmer'),
        orderDate: payloadDateSchema,
        from: z.string().trim().optional(),
        to: z.string().trim().optional(),
        truckNumber: z
          .string()
          .trim()
          .optional()
          .transform((val) => (val ? val.toUpperCase() : val)),
        remarks: z.string().max(500).default(''),
      }),
    []
  );

  const [summaryOpen, setSummaryOpen] = useState(false);
  const [vouchersSectionKey, setVouchersSectionKey] = useState(0);
  const openSheetRef = useRef(false);

  const form = useForm({
    defaultValues: editDefaultValues ?? defaultOutgoingFormValues,
    validators: {
      onSubmit: formSchema as never,
    },
    onSubmit: async ({ value }) => {
      if (isEditMode) {
        const payload = {
          ...(editId && { id: editId }),
          farmerStorageLinkId: value.farmerStorageLinkId,
          orderDate: payloadDateSchema.parse(value.orderDate),
          from: value.from?.trim() || undefined,
          to: value.to?.trim() || undefined,
          truckNumber: value.truckNumber?.trim().toUpperCase() || undefined,
          remarks: value.remarks?.trim() ?? '',
          manualParchiNumber: value.manualParchiNumber?.trim() || undefined,
        };
        console.log('Outgoing edit payload:', payload);
        return;
      }

      if (openSheetRef.current) {
        openSheetRef.current = false;
        const gatePassNo = nextVoucherNumber ?? 1;
        const payload = buildOutgoingPayload(
          {
            farmerStorageLinkId: value.farmerStorageLinkId,
            orderDate: value.orderDate,
            from: value.from,
            to: value.to,
            truckNumber: value.truckNumber?.trim() || undefined,
            remarks: value.remarks,
            manualParchiNumber: value.manualParchiNumber?.trim() || undefined,
          },
          gatePassNo,
          cellRemovedQuantities,
          incomingPasses
        );
        if (!payload) {
          toast.error('Please add at least one allocation', {
            description: 'Select quantities in the gate passes table.',
          });
          return;
        }
        setPendingPayload(payload);
        setSummaryOpen(true);
      }
    },
  });

  const farmerStorageLinkIdForPasses =
    (form.state.values as { farmerStorageLinkId?: string })
      .farmerStorageLinkId ?? '';
  const { data: incomingPasses = [] } = useGetIncomingGatePassesOfSingleFarmer(
    farmerStorageLinkIdForPasses
  );

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isEditMode) {
      form.handleSubmit();
      return;
    }
    openSheetRef.current = true;
    form.handleSubmit();
  };

  return (
    <main className="font-custom mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 space-y-4">
        <h1 className="font-custom text-foreground text-3xl font-bold sm:text-4xl">
          {isEditMode ? 'Edit Outgoing Gate Pass' : 'Create Outgoing Gate Pass'}
        </h1>

        <div className="bg-primary/20 inline-block rounded-full px-4 py-1.5">
          <span className="font-custom text-primary text-sm font-medium">
            GATE PASS NO: {voucherNumberDisplay}
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleReview} className="space-y-6">
        <FieldGroup className="space-y-6">
          {/* Manual Parchi Number */}
          <form.Field
            name="manualParchiNumber"
            children={(field) => (
              <Field>
                <FieldLabel className="font-custom mb-2 block text-base font-semibold">
                  Manual Parchi Number
                  <span className="font-custom text-muted-foreground ml-1 font-normal">
                    (optional)
                  </span>
                </FieldLabel>
                <Input
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g. 123"
                  className="font-custom"
                />
              </Field>
            )}
          />

          {/* Farmer Selection */}
          <form.Field
            name="farmerStorageLinkId"
            children={(field) => {
              const hasSubmitError = Boolean(
                field.state.meta.errorMap &&
                'onSubmit' in field.state.meta.errorMap &&
                field.state.meta.errorMap.onSubmit
              );
              const invalidFromValidation =
                hasSubmitError ||
                (field.state.meta.isTouched && !field.state.meta.isValid);
              const isInvalid = invalidFromValidation && !field.state.value;
              return (
                <Field data-invalid={isInvalid}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                    <div className="flex-1">
                      <FieldLabel
                        htmlFor="outgoing-farmer-select"
                        className="font-custom mb-2 block text-base font-semibold"
                      >
                        Enter Account Name (search and select)
                      </FieldLabel>
                      <SearchSelector
                        id="outgoing-farmer-select"
                        options={farmerOptions}
                        placeholder="Search or Create Farmer"
                        searchPlaceholder="Search by name, account number, or mobile..."
                        onSelect={handleFarmerSelect}
                        value={field.state.value}
                        loading={isLoadingFarmers}
                        loadingMessage="Loading farmers..."
                        emptyMessage="No farmers found"
                        buttonClassName="w-full justify-between"
                      />
                    </div>
                    <AddFarmerModal
                      links={farmerLinks ?? []}
                      onFarmerAdded={handleFarmerAdded}
                    />
                  </div>
                  {isInvalid && (
                    <FieldError
                      errors={field.state.meta.errors as FieldErrors}
                    />
                  )}
                </Field>
              );
            }}
          />

          {/* Date */}
          <form.Field
            name="orderDate"
            children={(field) => (
              <Field>
                <DatePicker
                  id="outgoing-order-date"
                  label="Order Date"
                  value={field.state.value}
                  onChange={(value) => field.handleChange(value)}
                />
                {field.state.meta.isTouched && !field.state.meta.isValid && (
                  <FieldError errors={field.state.meta.errors as FieldErrors} />
                )}
              </Field>
            )}
          />

          {/* From */}
          <form.Field
            name="from"
            children={(field) => (
              <Field>
                <FieldLabel className="font-custom mb-2 block text-base font-semibold">
                  From
                  <span className="font-custom text-muted-foreground ml-1 font-normal">
                    (optional)
                  </span>
                </FieldLabel>
                <Input
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g. Cold Storage"
                  className="font-custom"
                />
              </Field>
            )}
          />

          {/* To */}
          <form.Field
            name="to"
            children={(field) => (
              <Field>
                <FieldLabel className="font-custom mb-2 block text-base font-semibold">
                  To
                  <span className="font-custom text-muted-foreground ml-1 font-normal">
                    (optional)
                  </span>
                </FieldLabel>
                <Input
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g. Customer"
                  className="font-custom"
                />
              </Field>
            )}
          />

          {/* Truck Number */}
          <form.Field
            name="truckNumber"
            children={(field) => (
              <Field>
                <FieldLabel className="font-custom mb-2 block text-base font-semibold">
                  Truck Number
                  <span className="font-custom text-muted-foreground ml-1 font-normal">
                    (optional)
                  </span>
                </FieldLabel>
                <Input
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(e.target.value.toUpperCase())
                  }
                  placeholder="e.g. MH-12-AB-1234"
                  className="font-custom"
                />
              </Field>
            )}
          />

          {/* Remarks */}
          <form.Field
            name="remarks"
            children={(field) => (
              <Field>
                <FieldLabel className="font-custom mb-2 block text-base font-semibold">
                  Remarks
                </FieldLabel>
                <textarea
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="border-input bg-background text-foreground font-custom placeholder:text-muted-foreground focus-visible:ring-ring focus-visible:ring-offset-background w-full rounded-md border p-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  rows={4}
                />
              </Field>
            )}
          />

          {/* Edit mode: show issued quantities so user can update them */}
          {isEditMode && editEntry && (
            <Field>
              <FieldLabel className="font-custom mb-2 block text-base font-semibold">
                Allocated quantities
              </FieldLabel>
              <EditOutgoingAllocations
                editEntry={editEntry}
                cellRemovedQuantities={cellRemovedQuantities}
                setCellRemovedQuantities={setCellRemovedQuantities}
              />
            </Field>
          )}

          {/* Incoming gate passes for selected farmer (create only) */}
          {!isEditMode && (
            <form.Subscribe
              selector={(state) => ({
                farmerStorageLinkId: state.values.farmerStorageLinkId,
              })}
            >
              {({ farmerStorageLinkId }) => (
                <Field>
                  <FieldLabel className="font-custom mb-2 block text-base font-semibold">
                    Incoming gate passes
                  </FieldLabel>
                  <OutgoingVouchersSection
                    key={`${farmerStorageLinkId ?? ''}-${vouchersSectionKey}`}
                    farmerStorageLinkId={farmerStorageLinkId ?? ''}
                    cellRemovedQuantities={cellRemovedQuantities}
                    setCellRemovedQuantities={setCellRemovedQuantities}
                  />
                </Field>
              )}
            </form.Subscribe>
          )}
        </FieldGroup>

        {/* Review / Save button */}
        <div className="flex flex-wrap items-center justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset();
              setCellRemovedQuantities({});
              setVouchersSectionKey((k) => k + 1);
            }}
            className="font-custom"
          >
            Reset
          </Button>
          <Button
            type="submit"
            variant="default"
            size="lg"
            className="font-custom px-8 font-bold"
          >
            {isEditMode ? 'Save' : 'Review'}
          </Button>
        </div>
      </form>

      {!isEditMode && (
        <OutgoingSummarySheet
          open={summaryOpen}
          onOpenChange={setSummaryOpen}
          pendingPayload={pendingPayload}
          isSubmitting={createOutgoing.isPending}
          onConfirm={() => {
            if (!pendingPayload) return;
            createOutgoing.mutate(pendingPayload, {
              onSuccess: () => {
                setSummaryOpen(false);
                setPendingPayload(null);
                form.reset();
                setCellRemovedQuantities({});
                setVouchersSectionKey((k) => k + 1);
              },
            });
          }}
        />
      )}
    </main>
  );
});

export default OutgoingForm;
