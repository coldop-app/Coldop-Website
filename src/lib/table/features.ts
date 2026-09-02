import {
  type Cell,
  type Column,
  type ColumnDef,
  type FilterFn,
  type Row,
  type RowData,
  type SortFn,
  type Table,
  aggregationFn_sum,
  columnFacetingFeature,
  columnFilteringFeature,
  columnGroupingFeature,
  columnOrderingFeature,
  columnVisibilityFeature,
  createExpandedRowModel,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createGroupedRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  globalFilteringFeature,
  metaHelper,
  rowAggregationFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_text,
  tableFeatures,
} from '@tanstack/react-table';

/** Column `meta` shape shared by every table in the app. */
export type AppColumnMeta = {
  align?: 'left' | 'right';
  columnWidth?: string;
  compact?: boolean;
  emphasize?: boolean;
  filterLabel?: string;
  filterValueFormatter?: (value: unknown) => string;
  groupable?: boolean;
  groupStart?: boolean;
  mono?: boolean;
  numeric?: boolean;
  wrap?: boolean;
};

/**
 * Single, tree-shaken feature set used by every table in the app.
 * Row models, `sortFns` / `aggregationFns` string registries and the
 * per-table `columnMeta` type all live here.
 */
export const appTableFeatures = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  columnFacetingFeature,
  columnGroupingFeature,
  rowAggregationFeature,
  rowExpandingFeature,
  rowSortingFeature,
  rowPaginationFeature,
  columnVisibilityFeature,
  columnOrderingFeature,
  filteredRowModel: createFilteredRowModel(),
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  groupedRowModel: createGroupedRowModel(),
  expandedRowModel: createExpandedRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortFns: { text: sortFn_text },
  aggregationFns: { sum: aggregationFn_sum },
  columnMeta: metaHelper<AppColumnMeta>(),
});

export type AppTableFeatures = typeof appTableFeatures;

export type AppTable<TData extends RowData> = Table<AppTableFeatures, TData>;
export type AppRow<TData extends RowData> = Row<AppTableFeatures, TData>;
export type AppColumn<TData extends RowData, TValue = unknown> = Column<
  AppTableFeatures,
  TData,
  TValue
>;
export type AppCell<TData extends RowData, TValue = unknown> = Cell<
  AppTableFeatures,
  TData,
  TValue
>;
export type AppColumnDef<TData extends RowData, TValue = unknown> = ColumnDef<
  AppTableFeatures,
  TData,
  TValue
>;
export type AppFilterFn<TData extends RowData> = FilterFn<AppTableFeatures, TData>;
export type AppSortFn<TData extends RowData> = SortFn<AppTableFeatures, TData>;
