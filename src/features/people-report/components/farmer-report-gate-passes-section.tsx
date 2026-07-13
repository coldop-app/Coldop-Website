import {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  type GroupingState,
  type SortingState,
  type Table as TanStackTable,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnOrderState,
  type ExpandedState,
  type OnChangeFn,
  type VisibilityState,
} from '@tanstack/react-table';
import { FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { useColdStorageStore } from '@/features/auth/store/use-cold-storage-store';
import { usePreferencesStore } from '@/features/auth/store/use-preferences-store';
import { isIncomingDaybookEntry, isOutgoingDaybookEntry } from '@/features/daybook/types';
import {
  shouldShowCustomMarka,
  shouldShowStockFilter,
} from '@/features/incoming/utils/incoming-preferences';
import { useFarmerGatePasses } from '@/features/people/api/use-farmer-gate-passes';
import {
  farmerReportSortingFns,
  getFarmerReportBagSizeSignature,
  getFarmerReportColumnsForSizes,
} from '@/features/people-report/components/columns';
import {
  createDefaultFarmerReportViewState,
  DataTable,
  FARMER_REPORT_DEFAULT_SORTING,
  type FarmerReportViewState,
} from '@/features/people-report/components/data-table';
import { ReportToolbar } from '@/features/people-report/components/report-toolbar';
import { buildFarmerReportSections } from '@/features/people-report/utils/build-farmer-report-sections';
import { buildFarmerReportFilterSummaryLines } from '@/features/people-report/utils/build-farmer-report-filter-summary';
import { buildFarmerStockLedgerPdfData } from '@/features/people-report/utils/build-farmer-stock-ledger-pdf-data';
import {
  buildLedgerExportColumns,
  getFilteredGatePassEntriesFromTable,
  getFilteredLeafRowCount,
} from '@/features/people-report/utils/export-cell-value';
import {
  FARMER_STOCK_LEDGER_DOWNLOAD_EXCEL_DONE_MESSAGE,
  FARMER_STOCK_LEDGER_DOWNLOAD_EXCEL_MESSAGE,
  openFarmerStockLedgerPreview,
} from '@/features/people-report/utils/preview-farmer-stock-ledger-html';
import {
  countFarmerReportSearchMatches,
  createFarmerReportSearchIndex,
  filterFarmerReportSearchIndex,
} from '@/features/people-report/utils/report-search';
import type { FarmerReportTableRow } from '@/features/people-report/utils/build-farmer-report-sections';
import type { PersonDetailSearch } from '@/features/people/search';
import {
  FARMER_REPORT_GROUP_COLUMN_IDS,
  toggleFarmerReportGrouping,
  type FarmerReportGroupColumnId,
} from '@/features/people-report/utils/report-grouping';
import {
  advancedReportGlobalFilterFn,
  type AdvancedReportGlobalFilter,
  selectedValuesFilterFn,
} from '@/features/people-report/utils/report-filter-fns';
type FarmerReportGatePassesSectionProps = {
  linkId: string;
  search: PersonDetailSearch;
};

type ReportTableSectionProps = {
  title: string;
  subtitle: string;
  rowCount: number;
  columns: ColumnDef<FarmerReportTableRow>[];
  data: FarmerReportTableRow[];
  viewState: FarmerReportViewState;
  activeGrouping: GroupingState;
  expanded: ExpandedState;
  sorting: SortingState;
  onSortingChange: Dispatch<SetStateAction<SortingState>>;
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>;
  onColumnVisibilityChange: OnChangeFn<VisibilityState>;
  onColumnOrderChange: OnChangeFn<ColumnOrderState>;
  onGroupingChange: OnChangeFn<GroupingState>;
  onGlobalFilterChange: OnChangeFn<AdvancedReportGlobalFilter>;
  onExpandedChange: OnChangeFn<ExpandedState>;
  onTableReady?: (table: TanStackTable<FarmerReportTableRow>) => void;
  sectionMode?: 'incoming' | 'outgoing';
};

const defaultTableColumn: Partial<ColumnDef<FarmerReportTableRow, unknown>> = {
  filterFn: selectedValuesFilterFn,
};

const tableFilterFns = {
  selectedValues: selectedValuesFilterFn,
} as const;

const ReportTableSection = memo(function ReportTableSection({
  title,
  subtitle,
  rowCount,
  columns,
  data,
  viewState,
  activeGrouping,
  expanded,
  sorting,
  onSortingChange,
  onColumnFiltersChange,
  onColumnVisibilityChange,
  onColumnOrderChange,
  onGroupingChange,
  onGlobalFilterChange,
  onExpandedChange,
  onTableReady,
  sectionMode = 'incoming',
}: ReportTableSectionProps) {
  const sectionViewState = useMemo(
    () => ({ ...viewState, grouping: activeGrouping }),
    [viewState, activeGrouping],
  );

  return (
    <div className="border-border bg-card text-card-foreground overflow-hidden rounded-xl border shadow-sm">
      <div className="border-border/60 bg-muted/20 flex flex-col gap-2 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0 space-y-1">
          <h2 className="font-heading text-foreground text-base font-semibold">{title}</h2>
          <p className="text-muted-foreground text-sm">{subtitle}</p>
        </div>

        <Badge variant="outline" className="w-fit gap-1.5">
          <span className="tabular-nums">{rowCount}</span>
          rows
        </Badge>
      </div>

      <div className="relative">
        <DataTable
          columns={columns}
          data={data}
          sorting={sorting}
          onSortingChange={onSortingChange}
          viewState={sectionViewState}
          expanded={expanded}
          onColumnFiltersChange={onColumnFiltersChange}
          onColumnVisibilityChange={onColumnVisibilityChange}
          onColumnOrderChange={onColumnOrderChange}
          onGroupingChange={onGroupingChange}
          onGlobalFilterChange={onGlobalFilterChange}
          onExpandedChange={onExpandedChange}
          sectionMode={sectionMode}
          flush
          onTableReady={onTableReady}
        />
      </div>
    </div>
  );
});

function getExportFilteredEntries(
  searchFilteredEntries: ReturnType<typeof filterFarmerReportSearchIndex>,
  incomingTable: TanStackTable<FarmerReportTableRow> | null,
  outgoingTable: TanStackTable<FarmerReportTableRow> | null,
) {
  const filteredIncoming = incomingTable
    ? getFilteredGatePassEntriesFromTable(incomingTable)
    : searchFilteredEntries.filter(isIncomingDaybookEntry);
  const filteredOutgoing = outgoingTable
    ? getFilteredGatePassEntriesFromTable(outgoingTable)
    : searchFilteredEntries.filter(
        (entry) => isOutgoingDaybookEntry(entry) && entry.isNull !== true,
      );

  const incomingIds = new Set(filteredIncoming.map((entry) => entry._id));
  const outgoingIds = new Set(filteredOutgoing.map((entry) => entry._id));

  return searchFilteredEntries.filter((entry) => {
    if (isIncomingDaybookEntry(entry)) return incomingIds.has(entry._id);
    if (isOutgoingDaybookEntry(entry)) return outgoingIds.has(entry._id);
    return true;
  });
}

export function FarmerReportGatePassesSection({
  linkId,
  search,
}: FarmerReportGatePassesSectionProps) {
  const commodities = usePreferencesStore((state) => state.preferences?.commodities ?? []);
  const customMarkaPreference = usePreferencesStore((state) => state.preferences?.customMarka);
  const stockFilterPreference = usePreferencesStore((state) => state.preferences?.stockFilter);
  const showViewFilters = usePreferencesStore(
    (state) => state.preferences?.showViewFilters ?? false,
  );
  const coldStorageName = useColdStorageStore((state) => state.coldStorage?.name);
  const coldStorageAddress = useColdStorageStore((state) => state.coldStorage?.address);
  const showCustomMarka = shouldShowCustomMarka(customMarkaPreference);
  const showStockFilter = shouldShowStockFilter(stockFilterPreference);

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [appliedFrom, setAppliedFrom] = useState<string | undefined>();
  const [appliedTo, setAppliedTo] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewState, setViewState] = useState<FarmerReportViewState>(() =>
    createDefaultFarmerReportViewState(),
  );
  const [incomingSorting, setIncomingSorting] = useState<SortingState>(
    FARMER_REPORT_DEFAULT_SORTING,
  );
  const [outgoingSorting, setOutgoingSorting] = useState<SortingState>(
    FARMER_REPORT_DEFAULT_SORTING,
  );
  const [incomingExpanded, setIncomingExpanded] = useState<ExpandedState>({});
  const [outgoingExpanded, setOutgoingExpanded] = useState<ExpandedState>({});
  const [isExporting, setIsExporting] = useState(false);
  const [incomingFilteredCount, setIncomingFilteredCount] = useState(0);
  const [outgoingFilteredCount, setOutgoingFilteredCount] = useState(0);
  const previewWindowRef = useRef<Window | null>(null);
  const incomingTableRef = useRef<TanStackTable<FarmerReportTableRow> | null>(null);
  const outgoingTableRef = useRef<TanStackTable<FarmerReportTableRow> | null>(null);
  const columnsInitializedRef = useRef(false);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const activeGrouping = useMemo(() => {
    if (showStockFilter) return viewState.grouping;

    return viewState.grouping.filter((id) => id !== FARMER_REPORT_GROUP_COLUMN_IDS.stockFilter);
  }, [viewState.grouping, showStockFilter]);

  const onColumnFiltersChange = useCallback<OnChangeFn<ColumnFiltersState>>((updater) => {
    setViewState((current) => ({
      ...current,
      columnFilters: typeof updater === 'function' ? updater(current.columnFilters) : updater,
    }));
  }, []);

  const onColumnVisibilityChange = useCallback<OnChangeFn<VisibilityState>>((updater) => {
    setViewState((current) => ({
      ...current,
      columnVisibility: typeof updater === 'function' ? updater(current.columnVisibility) : updater,
    }));
  }, []);

  const onColumnOrderChange = useCallback<OnChangeFn<ColumnOrderState>>((updater) => {
    setViewState((current) => ({
      ...current,
      columnOrder: typeof updater === 'function' ? updater(current.columnOrder) : updater,
    }));
  }, []);

  const onGroupingChange = useCallback<OnChangeFn<GroupingState>>((updater) => {
    setViewState((current) => {
      const nextGrouping = typeof updater === 'function' ? updater(current.grouping) : updater;
      return {
        ...current,
        grouping: nextGrouping,
      };
    });
  }, []);

  const groupingSignature = viewState.grouping.join('\0');

  useEffect(() => {
    const expandedReset: ExpandedState = groupingSignature.length > 0 ? true : {};
    setIncomingExpanded(expandedReset);
    setOutgoingExpanded(expandedReset);
  }, [groupingSignature]);

  const onGlobalFilterChange = useCallback<OnChangeFn<AdvancedReportGlobalFilter>>((updater) => {
    setViewState((current) => ({
      ...current,
      globalFilter: typeof updater === 'function' ? updater(current.globalFilter) : updater,
    }));
  }, []);

  const onIncomingExpandedChange = useCallback<OnChangeFn<ExpandedState>>((updater) => {
    setIncomingExpanded((current) => (typeof updater === 'function' ? updater(current) : updater));
  }, []);

  const onOutgoingExpandedChange = useCallback<OnChangeFn<ExpandedState>>((updater) => {
    setOutgoingExpanded((current) => (typeof updater === 'function' ? updater(current) : updater));
  }, []);

  const handleToggleGrouping = useCallback(
    (columnId: FarmerReportGroupColumnId) => {
      onGroupingChange((current) => toggleFarmerReportGrouping(current, columnId));
    },
    [onGroupingChange],
  );

  const apiFilters = useMemo(
    () => ({
      type: 'all' as const,
      sortBy: 'latest' as const,
      ...(appliedFrom ? { from: appliedFrom } : {}),
      ...(appliedTo ? { to: appliedTo } : {}),
    }),
    [appliedFrom, appliedTo],
  );

  const gatePasses = useFarmerGatePasses(linkId, apiFilters);
  const searchIndex = useMemo(
    () => createFarmerReportSearchIndex(gatePasses.entries),
    [gatePasses.entries],
  );
  const filteredEntries = useMemo(
    () => filterFarmerReportSearchIndex(searchIndex, deferredSearchQuery),
    [deferredSearchQuery, searchIndex],
  );
  const visibleRowCount = useMemo(
    () => countFarmerReportSearchMatches(searchIndex, deferredSearchQuery),
    [deferredSearchQuery, searchIndex],
  );

  const sections = useMemo(
    () =>
      buildFarmerReportSections(filteredEntries, {
        splitOutgoingByVariety: activeGrouping.includes(FARMER_REPORT_GROUP_COLUMN_IDS.variety),
      }),
    [activeGrouping, filteredEntries],
  );

  const bagSizeSignature = useMemo(
    () => getFarmerReportBagSizeSignature(filteredEntries, commodities),
    [filteredEntries, commodities],
  );

  const columns = useMemo(
    () =>
      getFarmerReportColumnsForSizes(
        bagSizeSignature ? bagSizeSignature.split('\0') : [],
        showCustomMarka,
        showStockFilter,
      ),
    [bagSizeSignature, showCustomMarka, showStockFilter],
  );

  useEffect(() => {
    if (columns.length === 0 || columnsInitializedRef.current) return;

    const columnIds = columns
      .map((column) => column.id)
      .filter((columnId): columnId is string => Boolean(columnId));

    setViewState(createDefaultFarmerReportViewState(columnIds));
    columnsInitializedRef.current = true;
  }, [columns]);

  const combinedGatePassRows = useMemo(
    () => [
      ...sections.incoming.filter((row) => row.kind === 'gate-pass'),
      ...sections.outgoing.filter((row) => row.kind === 'gate-pass'),
    ],
    [sections.incoming, sections.outgoing],
  );

  const controlTable = useReactTable({
    data: combinedGatePassRows,
    columns,
    defaultColumn: defaultTableColumn,
    filterFns: tableFilterFns,
    globalFilterFn: advancedReportGlobalFilterFn,
    state: {
      columnFilters: viewState.columnFilters,
      columnVisibility: viewState.columnVisibility,
      columnOrder: viewState.columnOrder,
      grouping: activeGrouping,
      globalFilter: viewState.globalFilter,
    },
    onColumnFiltersChange,
    onColumnVisibilityChange,
    onColumnOrderChange,
    onGroupingChange,
    onGlobalFilterChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    sortingFns: farmerReportSortingFns,
  });

  const hasAnyRows = sections.incoming.length > 0 || sections.outgoing.length > 0;

  const visibleColumnIds = useMemo(
    () => controlTable.getVisibleLeafColumns().map((column) => column.id),
    [controlTable, viewState.columnVisibility, viewState.columnOrder, columns],
  );

  const exportColumns = useMemo(
    () => buildLedgerExportColumns(controlTable),
    [controlTable, viewState.columnVisibility, viewState.columnOrder, columns],
  );

  const updateFilteredCounts = useCallback(() => {
    if (incomingTableRef.current) {
      setIncomingFilteredCount(getFilteredLeafRowCount(incomingTableRef.current));
    }
    if (outgoingTableRef.current) {
      setOutgoingFilteredCount(getFilteredLeafRowCount(outgoingTableRef.current));
    }
  }, []);

  useEffect(() => {
    updateFilteredCounts();
  }, [updateFilteredCounts, viewState, sections, columns]);

  const handleIncomingTableReady = useCallback((table: TanStackTable<FarmerReportTableRow>) => {
    incomingTableRef.current = table;
    setIncomingFilteredCount(getFilteredLeafRowCount(table));
  }, []);

  const handleOutgoingTableReady = useCallback((table: TanStackTable<FarmerReportTableRow>) => {
    outgoingTableRef.current = table;
    setOutgoingFilteredCount(getFilteredLeafRowCount(table));
  }, []);

  const getExportEntries = useCallback(() => {
    return getExportFilteredEntries(
      filteredEntries,
      incomingTableRef.current,
      outgoingTableRef.current,
    );
  }, [filteredEntries]);

  const getPdfBuildInput = useCallback(() => {
    const exportEntries = getExportEntries();
    if (exportEntries.length === 0) return null;

    const exportSections = buildFarmerReportSections(exportEntries, {
      splitOutgoingByVariety: activeGrouping.includes(FARMER_REPORT_GROUP_COLUMN_IDS.variety),
    });

    return {
      entries: exportEntries,
      sections: exportSections,
      summaries: gatePasses.summaries,
      commodities,
      search,
      showStockFilter,
      showCustomMarka,
      grouping: activeGrouping,
      incomingSorting,
      outgoingSorting,
      visibleColumnIds,
      exportColumns,
      incomingTable: incomingTableRef.current,
      outgoingTable: outgoingTableRef.current,
    };
  }, [
    activeGrouping,
    commodities,
    exportColumns,
    gatePasses.summaries,
    getExportEntries,
    incomingSorting,
    outgoingSorting,
    search,
    showCustomMarka,
    showStockFilter,
    visibleColumnIds,
  ]);

  const buildExportInput = useCallback(() => {
    const pdfInput = getPdfBuildInput();
    if (!pdfInput || !coldStorageName) return null;

    const reportData = buildFarmerStockLedgerPdfData(pdfInput);
    const filterSummaryLines = buildFarmerReportFilterSummaryLines({
      appliedFrom,
      appliedTo,
      grouping: activeGrouping,
      viewTable: controlTable,
    });

    return {
      reportData,
      coldStorageName,
      coldStorageAddress,
      filterSummaryLines,
    };
  }, [
    activeGrouping,
    appliedFrom,
    appliedTo,
    coldStorageAddress,
    coldStorageName,
    controlTable,
    getPdfBuildInput,
  ]);

  const notifyPreviewDownloadComplete = useCallback(() => {
    const previewWindow = previewWindowRef.current;
    if (!previewWindow || previewWindow.closed) return;

    previewWindow.postMessage(
      { type: FARMER_STOCK_LEDGER_DOWNLOAD_EXCEL_DONE_MESSAGE },
      window.location.origin,
    );
  }, []);

  const handleExportExcel = useCallback(async () => {
    const exportInput = buildExportInput();
    if (!exportInput) {
      toast.error('No rows to export. Adjust filters or load report data.', {
        position: 'bottom-right',
      });
      return;
    }

    setIsExporting(true);

    try {
      const { exportFarmerStockLedgerExcel } =
        await import('@/features/people-report/utils/export-farmer-stock-ledger-excel');
      await exportFarmerStockLedgerExcel(exportInput);
      toast.success('Report exported to Excel', {
        position: 'bottom-right',
      });
    } catch (exportError) {
      toast.error(
        exportError instanceof Error ? exportError.message : 'Failed to export report to Excel',
        { position: 'bottom-right' },
      );
    } finally {
      setIsExporting(false);
      notifyPreviewDownloadComplete();
    }
  }, [buildExportInput, notifyPreviewDownloadComplete]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== FARMER_STOCK_LEDGER_DOWNLOAD_EXCEL_MESSAGE) return;

      void handleExportExcel();
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [handleExportExcel]);

  const handlePreview = useCallback(async () => {
    const exportInput = buildExportInput();
    if (!exportInput) {
      toast.error('No rows to preview. Adjust filters or load report data.', {
        position: 'bottom-right',
      });
      return;
    }

    try {
      const { buildFarmerStockLedgerPreviewData } =
        await import('@/features/people-report/utils/build-farmer-stock-ledger-excel');
      const preview = buildFarmerStockLedgerPreviewData(exportInput);

      previewWindowRef.current = openFarmerStockLedgerPreview({
        preview,
        coldStorageName: exportInput.coldStorageName,
        reportTitle: 'Farmer Stock Ledger',
        dateFrom: appliedFrom,
        dateTo: appliedTo,
      });
    } catch (previewError) {
      toast.error(
        previewError instanceof Error ? previewError.message : 'Failed to open report preview',
        { position: 'bottom-right' },
      );
    }
  }, [appliedFrom, appliedTo, buildExportInput]);

  const handleApply = useCallback(() => {
    setAppliedFrom(dateFrom || undefined);
    setAppliedTo(dateTo || undefined);
  }, [dateFrom, dateTo]);

  const handleReset = useCallback(() => {
    setDateFrom('');
    setDateTo('');
    setSearchQuery('');
    setAppliedFrom(undefined);
    setAppliedTo(undefined);
  }, []);

  const handleRefresh = useCallback(() => {
    void gatePasses.refetch();
  }, [gatePasses]);

  const farmerLabel = search.name?.trim() || 'Farmer';
  const isSearchPending = searchQuery !== deferredSearchQuery;
  const hasFilteredExportRows = incomingFilteredCount + outgoingFilteredCount > 0;
  const exportDisabled =
    gatePasses.isLoading || gatePasses.isFetching || !hasAnyRows || !hasFilteredExportRows;

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <div className="border-border bg-card text-card-foreground overflow-hidden rounded-xl border shadow-sm">
        <div className="border-border/60 bg-muted/20 border-b px-4 py-4 sm:px-6">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
              <h1 className="font-heading text-foreground truncate text-xl font-semibold tracking-tight sm:text-2xl">
                Stock ledger
              </h1>
              <p className="text-muted-foreground text-sm">
                {gatePasses.isLoading ? (
                  'Loading report...'
                ) : (
                  <>
                    <span className="text-foreground font-medium">{farmerLabel}</span>
                    {' · '}
                    <span className="text-foreground font-medium tabular-nums">
                      {visibleRowCount.toLocaleString('en-IN')}
                    </span>{' '}
                    {visibleRowCount === 1 ? 'gate pass' : 'gate passes'}
                    {isSearchPending ? (
                      <span className="text-muted-foreground"> (updating…)</span>
                    ) : null}
                  </>
                )}
              </p>
            </div>

            <Badge
              variant="secondary"
              className="border-border/60 bg-background/80 text-foreground w-fit gap-1.5"
            >
              <span className="bg-primary size-1.5 rounded-full" aria-hidden />
              {gatePasses.isFetching ? 'Refreshing' : 'Live API'}
            </Badge>
          </div>
        </div>

        <ReportToolbar
          table={hasAnyRows ? controlTable : null}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onApply={handleApply}
          onReset={handleReset}
          onRefresh={handleRefresh}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          grouping={activeGrouping}
          showStockFilterGrouping={showStockFilter}
          onToggleGrouping={handleToggleGrouping}
          isLoading={gatePasses.isLoading}
          isRefreshing={gatePasses.isFetching}
          isExporting={isExporting}
          onPreview={handlePreview}
          onExportExcel={handleExportExcel}
          getPdfBuildInput={getPdfBuildInput}
          pdfDisabled={exportDisabled}
          previewDisabled={exportDisabled}
          excelDisabled={exportDisabled}
          showViewFilters={showViewFilters}
        />
      </div>

      {gatePasses.isError ? (
        <div
          className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border px-4 py-3 text-sm"
          role="alert"
        >
          {gatePasses.error instanceof Error
            ? gatePasses.error.message
            : 'Could not load gate passes.'}
        </div>
      ) : null}

      {gatePasses.isLoading ? (
        <div className="border-border bg-card text-card-foreground overflow-hidden rounded-xl border shadow-sm">
          <div className="text-muted-foreground flex min-h-56 items-center justify-center gap-2 p-6 text-sm">
            <Loader2 className="size-4 animate-spin" />
            Loading stock ledger...
          </div>
        </div>
      ) : !hasAnyRows ? (
        <Empty className="bg-muted/10 rounded-xl border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText />
            </EmptyMedia>
            <EmptyTitle>No gate passes found</EmptyTitle>
            <EmptyDescription>
              {gatePasses.emptyMessage ?? 'Try changing the date range or search query.'}
            </EmptyDescription>
          </EmptyHeader>
          {gatePasses.isError ? null : (
            <Button variant="outline" onClick={handleReset}>
              Reset filters
            </Button>
          )}
        </Empty>
      ) : (
        <div className="flex flex-col gap-4">
          {sections.incoming.length > 0 ? (
            <ReportTableSection
              title="Incoming gate passes"
              subtitle="Normal and internally transferred receipts for the selected date range."
              rowCount={incomingFilteredCount}
              columns={columns}
              data={sections.incoming}
              viewState={viewState}
              activeGrouping={activeGrouping}
              expanded={incomingExpanded}
              sorting={incomingSorting}
              onSortingChange={setIncomingSorting}
              onColumnFiltersChange={onColumnFiltersChange}
              onColumnVisibilityChange={onColumnVisibilityChange}
              onColumnOrderChange={onColumnOrderChange}
              onGroupingChange={onGroupingChange}
              onGlobalFilterChange={onGlobalFilterChange}
              onExpandedChange={onIncomingExpandedChange}
              onTableReady={handleIncomingTableReady}
              sectionMode="incoming"
            />
          ) : null}

          {sections.outgoing.length > 0 ? (
            <ReportTableSection
              title="Outgoing gate passes"
              subtitle="Deliveries and internal transfers for the selected date range."
              rowCount={outgoingFilteredCount}
              columns={columns}
              data={sections.outgoing}
              viewState={viewState}
              activeGrouping={activeGrouping}
              expanded={outgoingExpanded}
              sorting={outgoingSorting}
              onSortingChange={setOutgoingSorting}
              onColumnFiltersChange={onColumnFiltersChange}
              onColumnVisibilityChange={onColumnVisibilityChange}
              onColumnOrderChange={onColumnOrderChange}
              onGroupingChange={onGroupingChange}
              onGlobalFilterChange={onGlobalFilterChange}
              onExpandedChange={onOutgoingExpandedChange}
              onTableReady={handleOutgoingTableReady}
              sectionMode="outgoing"
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
