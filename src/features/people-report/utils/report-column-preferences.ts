import type { ColumnDef, ColumnOrderState, VisibilityState } from '@tanstack/react-table';

const STORAGE_KEY = 'farmer-stock-ledger:column-preferences:v1';

type StoredColumnPreferences = {
  version: 1;
  hiddenColumnIds: string[];
  columnOrder: string[];
};

export type FarmerReportColumnState = {
  columnVisibility: VisibilityState;
  columnOrder: ColumnOrderState;
};

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function getColumnId(column: ColumnDef<unknown, unknown>, index: number) {
  const candidate = column as {
    id?: string;
    accessorKey?: string | number | symbol;
  };

  if (candidate.id) return candidate.id;
  if (candidate.accessorKey != null) return String(candidate.accessorKey);
  return `col-${index}`;
}

function parsePreferences(value: string | null): StoredColumnPreferences | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<StoredColumnPreferences>;

    if (
      parsed.version !== 1 ||
      !Array.isArray(parsed.hiddenColumnIds) ||
      !Array.isArray(parsed.columnOrder)
    ) {
      return null;
    }

    return {
      version: 1,
      hiddenColumnIds: parsed.hiddenColumnIds.filter(
        (columnId): columnId is string => typeof columnId === 'string',
      ),
      columnOrder: parsed.columnOrder.filter(
        (columnId): columnId is string => typeof columnId === 'string',
      ),
    };
  } catch {
    return null;
  }
}

function toColumnState(
  preferences: StoredColumnPreferences | null,
  columnIds: string[],
): FarmerReportColumnState {
  if (!preferences) {
    return {
      columnVisibility: {},
      columnOrder: [],
    };
  }

  const columnIdSet = new Set(columnIds);
  const columnVisibility = preferences.hiddenColumnIds.reduce<VisibilityState>(
    (visibility, columnId) => {
      if (columnIdSet.has(columnId)) visibility[columnId] = false;
      return visibility;
    },
    {},
  );

  return {
    columnVisibility,
    columnOrder: preferences.columnOrder.filter((columnId) => columnIdSet.has(columnId)),
  };
}

export function getFarmerReportColumnIds(columns: ColumnDef<unknown, unknown>[]) {
  return columns.map(getColumnId);
}

export function getStoredFarmerReportColumnState(columnIds: string[]): FarmerReportColumnState {
  const storage = getStorage();
  const preferences = parsePreferences(storage?.getItem(STORAGE_KEY) ?? null);

  return toColumnState(preferences, columnIds);
}

export function hasStoredFarmerReportColumnState() {
  return parsePreferences(getStorage()?.getItem(STORAGE_KEY) ?? null) != null;
}

export function saveFarmerReportColumnState(
  columnIds: string[],
  columnVisibility: VisibilityState,
  columnOrder: ColumnOrderState,
) {
  const storage = getStorage();
  if (!storage) return false;

  const columnIdSet = new Set(columnIds);
  const preferences: StoredColumnPreferences = {
    version: 1,
    hiddenColumnIds: columnIds.filter((columnId) => columnVisibility[columnId] === false),
    columnOrder: columnOrder.filter((columnId) => columnIdSet.has(columnId)),
  };

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    return true;
  } catch {
    return false;
  }
}

export function clearStoredFarmerReportColumnState() {
  const storage = getStorage();
  if (!storage) return false;

  try {
    storage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
