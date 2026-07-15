import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePreferencesStore } from '@/features/auth/store/use-preferences-store';
import {
  getPreferredBagSizeOrderForTransfer,
  shouldShowStockFilter,
} from '@/features/incoming/utils/incoming-preferences';
import type {
  DatePassGroup,
  LocationFilters,
  StorageGatePass,
  VoucherSort,
} from '@/features/transfer-stock/types/storage-gate-pass';
import {
  buildAllocationsFromPass,
  filterStorageGatePasses,
  getUniqueLocationValues,
  getUniqueSizes,
  getUniqueVarietiesForStockFilter,
  groupPassesByDate,
  parseAllocationKey,
} from '@/features/transfer-stock/utils/gate-pass-matrix-utils';

/** `'all'` shows every size column; otherwise only sizes in the set. */
export type SizeVisibility = 'all' | Set<string>;

/** `'all'` shows every variety; otherwise only varieties in the set. */
export type VarietyVisibility = 'all' | Set<string>;

export type VarietyFilterMode = 'single-required' | 'multi-optional';

function isSizeVisible(visibility: SizeVisibility, size: string): boolean {
  return visibility === 'all' || visibility.has(size);
}

function isVarietyVisible(visibility: VarietyVisibility, variety: string): boolean {
  return visibility === 'all' || visibility.has(variety);
}

export function formatVarietyVisibilityLabel(visibility: VarietyVisibility): string {
  if (visibility === 'all') return 'All';
  if (visibility.size === 0) return 'None';
  return [...visibility].sort((a, b) => a.localeCompare(b)).join(', ');
}

function resolveVisibleSizes(tableSizes: string[], visibility: SizeVisibility): string[] {
  if (visibility === 'all') return tableSizes;
  return tableSizes.filter((size) => visibility.has(size));
}

function getPassesForVarietyScope(
  passes: StorageGatePass[],
  varietyFilterMode: VarietyFilterMode,
  varietyVisibility: VarietyVisibility,
  varietyFilter: string,
): StorageGatePass[] {
  if (varietyFilterMode === 'multi-optional') {
    if (varietyVisibility === 'all') return passes;
    return filterStorageGatePasses(passes, {
      varieties: [...varietyVisibility],
    });
  }

  if (!varietyFilter.trim()) return [];
  return filterStorageGatePasses(passes, { variety: varietyFilter });
}

type UseTransferGatePassMatrixOptions = {
  allPasses: StorageGatePass[];
  allocations: Record<string, number>;
  onAllocationsChange: (next: Record<string, number>) => void;
  varietyFilterMode?: VarietyFilterMode;
  /** When set, locks the matrix to this stock filter and hides the filter control. */
  stockFilter?: string;
  /** Variety selected when the matrix first opens and when filters are reset. */
  initialVariety?: string;
};

export function useTransferGatePassMatrix({
  allPasses,
  allocations,
  onAllocationsChange,
  varietyFilterMode = 'single-required',
  stockFilter: controlledStockFilter,
  initialVariety,
}: UseTransferGatePassMatrixOptions) {
  const initialVarietyVisibility = useMemo<VarietyVisibility>(
    () => (initialVariety?.trim() ? new Set([initialVariety.trim()]) : 'all'),
    [initialVariety],
  );
  const [voucherSort, setVoucherSort] = useState<VoucherSort>('asc');
  const [varietyFilter, setVarietyFilter] = useState('');
  const [varietyVisibility, setVarietyVisibility] =
    useState<VarietyVisibility>(initialVarietyVisibility);
  const [sizeVisibility, setSizeVisibility] = useState<SizeVisibility>('all');
  const [selectedPassIds, setSelectedPassIds] = useState<Set<string>>(() => new Set());
  const [locationFilters, setLocationFilters] = useState<LocationFilters>({
    chamber: '',
    floor: '',
    row: '',
  });
  const [gatePassSearch, setGatePassSearch] = useState('');
  const [stockFilterFilter, setStockFilterFilter] = useState('');

  const preferences = usePreferencesStore((state) => state.preferences);
  const commodities = preferences?.commodities ?? [];
  const showStockFilter = shouldShowStockFilter(preferences?.stockFilter);
  const stockFilterOptions = preferences?.stockFilter?.options ?? [];
  const isStockFilterControlled = controlledStockFilter !== undefined;
  const effectiveStockFilter = isStockFilterControlled
    ? controlledStockFilter.trim()
    : stockFilterFilter.trim();

  const varietyForSizeOrder = useMemo(() => {
    if (varietyFilterMode === 'multi-optional') {
      if (varietyVisibility === 'all') return '';
      if (varietyVisibility.size === 1) {
        return [...varietyVisibility][0] ?? '';
      }
      return '';
    }
    return varietyFilter;
  }, [varietyFilterMode, varietyVisibility, varietyFilter]);

  const preferredSizeOrder = useMemo(
    () => getPreferredBagSizeOrderForTransfer(commodities, varietyForSizeOrder),
    [commodities, varietyForSizeOrder],
  );

  const uniqueVarieties = useMemo(
    () => getUniqueVarietiesForStockFilter(allPasses, effectiveStockFilter || undefined),
    [allPasses, effectiveStockFilter],
  );

  useEffect(() => {
    if (varietyFilter.trim() && !uniqueVarieties.includes(varietyFilter.trim())) {
      setVarietyFilter('');
    }
  }, [uniqueVarieties, varietyFilter]);

  useEffect(() => {
    setVarietyVisibility((prev) => {
      if (prev === 'all') return prev;
      const next = new Set([...prev].filter((variety) => uniqueVarieties.includes(variety)));
      if (next.size === prev.size && [...prev].every((variety) => next.has(variety))) {
        return prev;
      }
      if (uniqueVarieties.length > 0 && uniqueVarieties.every((variety) => next.has(variety))) {
        return 'all';
      }
      return next;
    });
  }, [uniqueVarieties]);

  const varietyScopedPasses = useMemo(() => {
    let passes = getPassesForVarietyScope(
      allPasses,
      varietyFilterMode,
      varietyVisibility,
      varietyFilter,
    );
    if (effectiveStockFilter) {
      passes = filterStorageGatePasses(passes, {
        stockFilter: effectiveStockFilter,
      });
    }
    return passes;
  }, [allPasses, varietyFilterMode, varietyVisibility, varietyFilter, effectiveStockFilter]);

  const uniqueLocations = useMemo(
    () => getUniqueLocationValues(varietyScopedPasses),
    [varietyScopedPasses],
  );

  useEffect(() => {
    setLocationFilters((prev) => {
      const chamberValid = !prev.chamber || uniqueLocations.chambers.includes(prev.chamber);
      const floorValid = !prev.floor || uniqueLocations.floors.includes(prev.floor);
      const rowValid = !prev.row || uniqueLocations.rows.includes(prev.row);

      if (chamberValid && floorValid && rowValid) return prev;

      return {
        chamber: chamberValid ? prev.chamber : '',
        floor: floorValid ? prev.floor : '',
        row: rowValid ? prev.row : '',
      };
    });
  }, [uniqueLocations]);

  const filteredPasses = useMemo(() => {
    const base = {
      search: gatePassSearch,
      location: locationFilters,
      preferences,
      ...(effectiveStockFilter ? { stockFilter: effectiveStockFilter } : {}),
    };

    if (varietyFilterMode === 'multi-optional') {
      if (varietyVisibility === 'all') {
        return filterStorageGatePasses(allPasses, base);
      }
      return filterStorageGatePasses(allPasses, {
        ...base,
        varieties: [...varietyVisibility],
      });
    }

    return filterStorageGatePasses(allPasses, {
      ...base,
      variety: varietyFilter,
    });
  }, [
    allPasses,
    varietyFilterMode,
    varietyVisibility,
    varietyFilter,
    gatePassSearch,
    locationFilters,
    preferences,
    effectiveStockFilter,
  ]);

  const tableSizes = useMemo(
    () => getUniqueSizes(filteredPasses, preferredSizeOrder),
    [filteredPasses, preferredSizeOrder],
  );

  const allTableSizes = useMemo(
    () => getUniqueSizes(allPasses, preferredSizeOrder),
    [allPasses, preferredSizeOrder],
  );

  const visibleSizes = useMemo(
    () => resolveVisibleSizes(tableSizes, sizeVisibility),
    [tableSizes, sizeVisibility],
  );

  const displayGroups: DatePassGroup[] = useMemo(
    () => groupPassesByDate(filteredPasses, voucherSort),
    [filteredPasses, voucherSort],
  );

  const needsVarietySelection =
    varietyFilterMode === 'single-required' &&
    uniqueVarieties.length > 0 &&
    varietyFilter.trim() === '';

  const varietySelected = !needsVarietySelection;
  const hasFilteredData = varietySelected && filteredPasses.length > 0 && visibleSizes.length > 0;

  const hasActiveFilters =
    (varietyFilterMode === 'multi-optional'
      ? varietyVisibility !== 'all'
      : varietyFilter.trim() !== '') ||
    gatePassSearch.trim() !== '' ||
    locationFilters.chamber !== '' ||
    locationFilters.floor !== '' ||
    locationFilters.row !== '' ||
    (!isStockFilterControlled && stockFilterFilter.trim() !== '');

  const varietyVisibilityLabel = useMemo(
    () => formatVarietyVisibilityLabel(varietyVisibility),
    [varietyVisibility],
  );

  const sizesForColumnPicker = tableSizes.length > 0 ? tableSizes : allTableSizes;

  const handleSelectAllSizes = useCallback(() => {
    setSizeVisibility('all');
  }, []);

  const handleSizeToggle = useCallback(
    (size: string) => {
      setSizeVisibility((prev) => {
        const pickerSizes = tableSizes.length > 0 ? tableSizes : allTableSizes;

        if (prev === 'all') {
          const next = new Set(pickerSizes);
          next.delete(size);
          return next;
        }

        const next = new Set(prev);
        if (next.has(size)) next.delete(size);
        else next.add(size);

        if (pickerSizes.length > 0 && pickerSizes.every((s) => next.has(s))) {
          return 'all';
        }
        return next;
      });
    },
    [tableSizes, allTableSizes],
  );

  const handleSelectAllVarieties = useCallback(() => {
    setVarietyVisibility('all');
  }, []);

  const handleVarietyToggle = useCallback(
    (variety: string) => {
      setVarietyVisibility((prev) => {
        const pickerVarieties = uniqueVarieties.length > 0 ? uniqueVarieties : [];

        if (prev === 'all') {
          const next = new Set(pickerVarieties);
          next.delete(variety);
          return next;
        }

        const next = new Set(prev);
        if (next.has(variety)) next.delete(variety);
        else next.add(variety);

        if (pickerVarieties.length > 0 && pickerVarieties.every((v) => next.has(v))) {
          return 'all';
        }
        return next;
      });
    },
    [uniqueVarieties],
  );

  const handleResetFilters = useCallback(() => {
    setVoucherSort('asc');
    setVarietyFilter('');
    setVarietyVisibility(initialVarietyVisibility);
    setGatePassSearch('');
    setStockFilterFilter('');
    setLocationFilters({ chamber: '', floor: '', row: '' });
    setSizeVisibility('all');
    setSelectedPassIds(new Set());
    onAllocationsChange({});
  }, [initialVarietyVisibility, onAllocationsChange]);

  const handleAllocationChange = useCallback(
    (key: string, quantity: number) => {
      onAllocationsChange({ ...allocations, [key]: quantity });
    },
    [allocations, onAllocationsChange],
  );

  const handleAllocationClear = useCallback(
    (key: string) => {
      const next = { ...allocations };
      delete next[key];
      onAllocationsChange(next);
    },
    [allocations, onAllocationsChange],
  );

  const handlePassToggle = useCallback(
    (passId: string) => {
      const isSelecting = !selectedPassIds.has(passId);

      setSelectedPassIds((prev) => {
        const next = new Set(prev);
        if (isSelecting) next.add(passId);
        else next.delete(passId);
        return next;
      });

      if (isSelecting) {
        const pass = filteredPasses.find((p) => p._id === passId);
        if (pass) {
          onAllocationsChange({
            ...allocations,
            ...buildAllocationsFromPass(pass, visibleSizes),
          });
        }
      } else {
        const next = { ...allocations };
        for (const key of Object.keys(next)) {
          const parsed = parseAllocationKey(key);
          if (parsed?.passId === passId) delete next[key];
        }
        onAllocationsChange(next);
      }
    },
    [selectedPassIds, filteredPasses, visibleSizes, allocations, onAllocationsChange],
  );

  return {
    displayGroups,
    visibleSizes,
    uniqueVarieties,
    uniqueLocations,
    hasFilteredData,
    hasActiveFilters,
    needsVarietySelection,
    varietyFilterMode,
    voucherSort,
    setVoucherSort,
    varietyFilter,
    setVarietyFilter,
    varietyVisibility,
    setVarietyVisibility,
    varietyVisibilityLabel,
    gatePassSearch,
    setGatePassSearch,
    stockFilterFilter,
    setStockFilterFilter,
    showStockFilter: showStockFilter && !isStockFilterControlled,
    isStockFilterControlled,
    stockFilterOptions,
    locationFilters,
    setLocationFilters,
    sizeVisibility,
    setSizeVisibility,
    selectedPassIds,
    sizesForColumnPicker,
    isSizeVisible,
    isVarietyVisible,
    handleSelectAllSizes,
    handleSizeToggle,
    handleSelectAllVarieties,
    handleVarietyToggle,
    handleResetFilters,
    handleAllocationChange,
    handleAllocationClear,
    handlePassToggle,
  };
}
