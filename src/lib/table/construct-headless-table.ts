import {
  constructTable,
  type RowData,
  type TableOptions,
  tableFeatures,
} from '@tanstack/react-table';
import { storeReactivityBindings } from '@tanstack/table-core/store-reactivity-bindings';

import { type AppTable, type AppTableFeatures, appTableFeatures } from '@/lib/table/features';

export type HeadlessTableOptions<TData extends RowData> = Omit<
  TableOptions<AppTableFeatures, TData>,
  'features'
>;

/**
 * `useTable` injects React reactivity bindings automatically. Outside React
 * (exports, PDFs, tests) `constructTable` needs explicit TanStack Store bindings.
 */
const headlessTableFeatures = tableFeatures({
  coreReactivityFeature: storeReactivityBindings(),
  ...appTableFeatures,
});

/** Builds a non-React (headless) table instance sharing the app feature set. */
export function constructHeadlessTable<TData extends RowData>(
  options: HeadlessTableOptions<TData>,
): AppTable<TData> {
  const table = constructTable({
    ...(options as TableOptions<typeof headlessTableFeatures, TData>),
    features: headlessTableFeatures,
  });

  return table as unknown as AppTable<TData>;
}
