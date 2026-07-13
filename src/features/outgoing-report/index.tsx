import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import type { Table as TanStackTable } from '@tanstack/react-table';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useColdStorageStore } from '@/features/auth/store/use-cold-storage-store';
import { usePreferencesStore } from '@/features/auth/store/use-preferences-store';
import { shouldShowStockFilter } from '@/features/incoming/utils/incoming-preferences';
import type { OutgoingGatePassReportRecord } from '@/features/outgoing-report/api/types';

import {
  useOutgoingGatePassReport,
  type OutgoingGatePassReportParams,
} from './api/use-outgoing-gate-pass-report';
import { getOutgoingReportColumns, type OutgoingQuantityMode } from './components/columns';
import { DataTable } from './components/data-table';
import { ReportToolbar } from './components/report-toolbar';
import {
  OUTGOING_REPORT_DOWNLOAD_EXCEL_DONE_MESSAGE,
  OUTGOING_REPORT_DOWNLOAD_EXCEL_MESSAGE,
  openOutgoingReportPreview,
} from './utils/preview-outgoing-report-html';
import {
  countOutgoingReportSearchMatches,
  createOutgoingReportSearchIndex,
} from './utils/report-search';
import { buildOutgoingReportPdfData } from './utils/build-outgoing-report-pdf-data';

const DEFAULT_REPORT_PARAMS = {} satisfies OutgoingGatePassReportParams;

const OutgoingReportPage = () => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isReportTableReady, setIsReportTableReady] = useState(false);
  const [quantityMode, setQuantityMode] = useState<OutgoingQuantityMode>('issued');
  const [showLocation, setShowLocation] = useState(true);
  const [appliedParams, setAppliedParams] =
    useState<OutgoingGatePassReportParams>(DEFAULT_REPORT_PARAMS);
  const [isExporting, setIsExporting] = useState(false);
  const reportTableRef = useRef<TanStackTable<OutgoingGatePassReportRecord> | null>(null);
  const previewWindowRef = useRef<Window | null>(null);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const coldStorageName = useColdStorageStore((s) => s.coldStorage?.name);
  const stockFilterPreference = usePreferencesStore((state) => state.preferences?.stockFilter);
  const showViewFilters = usePreferencesStore(
    (state) => state.preferences?.showViewFilters ?? false,
  );
  const showStockFilter = shouldShowStockFilter(stockFilterPreference);
  const { data, error, isFetching, isLoading, refetch } = useOutgoingGatePassReport(appliedParams);

  const reportRows = useMemo(
    () => data?.data.outgoingGatePasses ?? [],
    [data?.data.outgoingGatePasses],
  );
  const searchIndex = useMemo(() => createOutgoingReportSearchIndex(reportRows), [reportRows]);
  const visibleRowCount = useMemo(
    () => countOutgoingReportSearchMatches(searchIndex, deferredSearchQuery),
    [deferredSearchQuery, searchIndex],
  );
  const tableColumns = useMemo(
    () => getOutgoingReportColumns(reportRows, quantityMode, showStockFilter, showLocation),
    [quantityMode, reportRows, showStockFilter, showLocation],
  );

  const handleTableReady = useCallback((table: TanStackTable<OutgoingGatePassReportRecord>) => {
    reportTableRef.current = table;
    setIsReportTableReady((ready) => ready || true);
  }, []);

  useEffect(() => {
    if (data) return;

    reportTableRef.current = null;
    setIsReportTableReady(false);
  }, [data]);

  const notifyPreviewDownloadComplete = useCallback(() => {
    const previewWindow = previewWindowRef.current;
    if (!previewWindow || previewWindow.closed) return;

    previewWindow.postMessage(
      { type: OUTGOING_REPORT_DOWNLOAD_EXCEL_DONE_MESSAGE },
      window.location.origin,
    );
  }, []);

  const handleExportExcel = useCallback(async () => {
    const reportTable = reportTableRef.current;
    if (!reportTable) return;

    const filteredRowCount = reportTable.getFilteredRowModel().rows.length;

    if (filteredRowCount === 0) {
      toast.error('No rows to export. Adjust filters or load report data.', {
        position: 'bottom-right',
      });
      return;
    }

    setIsExporting(true);

    try {
      const { exportOutgoingReportToExcel } = await import('./utils/export-outgoing-report-excel');
      await exportOutgoingReportToExcel({
        table: reportTable,
        coldStorageName: coldStorageName ?? 'Cold Storage',
        quantityMode,
        showLocation,
        reportTitle: 'Outgoing Report',
        dateFrom,
        dateTo,
      });
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
  }, [
    coldStorageName,
    dateFrom,
    dateTo,
    notifyPreviewDownloadComplete,
    quantityMode,
    showLocation,
  ]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== OUTGOING_REPORT_DOWNLOAD_EXCEL_MESSAGE) return;

      void handleExportExcel();
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [handleExportExcel]);

  const handlePreview = useCallback(async () => {
    const reportTable = reportTableRef.current;
    if (!reportTable) return;

    const filteredRowCount = reportTable.getFilteredRowModel().rows.length;

    if (filteredRowCount === 0) {
      toast.error('No rows to preview. Adjust filters or load report data.', {
        position: 'bottom-right',
      });
      return;
    }

    try {
      const { buildOutgoingReportPreviewData } =
        await import('./utils/export-outgoing-report-excel');
      const preview = buildOutgoingReportPreviewData({
        table: reportTable,
        coldStorageName: coldStorageName ?? 'Cold Storage',
        quantityMode,
        showLocation,
        reportTitle: 'Outgoing Report',
        dateFrom,
        dateTo,
      });

      previewWindowRef.current = openOutgoingReportPreview({
        preview,
        coldStorageName: coldStorageName ?? 'Cold Storage',
        reportTitle: 'Outgoing Report',
        dateFrom,
        dateTo,
      });
    } catch (previewError) {
      toast.error(
        previewError instanceof Error ? previewError.message : 'Failed to open report preview',
        { position: 'bottom-right' },
      );
    }
  }, [coldStorageName, dateFrom, dateTo, quantityMode, showLocation]);

  const handleApply = useCallback(() => {
    const next: OutgoingGatePassReportParams = {};
    if (dateFrom) next.dateFrom = dateFrom;
    if (dateTo) next.dateTo = dateTo;

    setAppliedParams(next);
  }, [dateFrom, dateTo]);

  const handleReset = useCallback(() => {
    setDateFrom('');
    setDateTo('');
    setSearchQuery('');
    setAppliedParams(DEFAULT_REPORT_PARAMS);
  }, []);

  const handleRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const handleQuantityModeChange = useCallback((value: string) => {
    setQuantityMode(value as OutgoingQuantityMode);
  }, []);

  const getPdfData = useCallback(() => {
    const reportTable = reportTableRef.current;
    if (!reportTable) return null;

    if (reportTable.getFilteredRowModel().rows.length === 0) return null;

    return buildOutgoingReportPdfData({
      table: reportTable,
      quantityMode,
      showLocation,
      reportTitle: 'Outgoing Report',
      dateFrom,
      dateTo,
    });
  }, [dateFrom, dateTo, quantityMode, showLocation]);

  const reportTable = isReportTableReady ? reportTableRef.current : null;
  const isSearchPending = searchQuery !== deferredSearchQuery;

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <div className="border-border bg-card text-card-foreground overflow-hidden rounded-xl border shadow-sm">
        <div className="border-border/60 bg-muted/20 border-b px-4 py-4 sm:px-6">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
              <h1 className="font-heading text-foreground truncate text-xl font-semibold tracking-tight sm:text-2xl">
                Outgoing report
              </h1>
              <p className="text-muted-foreground text-sm">
                {isLoading ? (
                  'Loading report...'
                ) : (
                  <>
                    <span className="text-foreground font-medium tabular-nums">
                      {visibleRowCount.toLocaleString('en-IN')}
                    </span>{' '}
                    {visibleRowCount === 1 ? 'outgoing gate pass' : 'outgoing gate passes'}
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
              {isFetching ? 'Refreshing' : 'Live API'}
            </Badge>
          </div>
        </div>

        <ReportToolbar
          table={reportTable}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onApply={handleApply}
          onReset={handleReset}
          onRefresh={handleRefresh}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isLoading={isLoading}
          isRefreshing={isFetching}
          isExporting={isExporting}
          onPreview={handlePreview}
          onExportExcel={handleExportExcel}
          getPdfData={getPdfData}
          pdfDisabled={isLoading || !reportTable}
          showViewFilters={showViewFilters}
        />
      </div>

      {error ? (
        <div
          className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border px-4 py-3 text-sm"
          role="alert"
        >
          {error.message}
        </div>
      ) : null}

      <div className="border-border bg-card text-card-foreground overflow-hidden rounded-xl border shadow-sm">
        <div className="border-border/60 bg-muted/20 flex flex-col gap-2 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-w-0 space-y-1">
            <h2 className="font-heading text-foreground text-base font-semibold">
              Outgoing gate passes
            </h2>
            <p className="text-muted-foreground text-sm">
              A simple table for the selected date range.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <Switch
                id="outgoing-show-location"
                size="sm"
                checked={showLocation}
                onCheckedChange={setShowLocation}
                aria-label="Show location"
              />
              <Label
                htmlFor="outgoing-show-location"
                className="cursor-pointer text-sm font-medium"
              >
                Show Location
              </Label>
            </div>

            <Tabs value={quantityMode} onValueChange={handleQuantityModeChange}>
              <TabsList aria-label="Quantity view">
                <TabsTrigger value="issued">Issued Qty</TabsTrigger>
                <TabsTrigger value="available">Available Qty</TabsTrigger>
              </TabsList>
            </Tabs>

            <Badge variant="outline" className="w-fit gap-1.5">
              <span className="tabular-nums">{visibleRowCount}</span>
              rows
            </Badge>
          </div>
        </div>

        <div className="relative">
          {isLoading ? (
            <div className="text-muted-foreground flex min-h-56 items-center justify-center gap-2 p-6 text-sm">
              <Loader2 className="size-4 animate-spin" />
              Loading outgoing report...
            </div>
          ) : data ? (
            <div className="min-w-0">
              <DataTable
                columns={tableColumns}
                data={reportRows}
                quantityMode={quantityMode}
                quickSearch={searchQuery}
                onTableReady={handleTableReady}
              />
            </div>
          ) : (
            <div className="text-muted-foreground flex min-h-56 items-center justify-center p-6 text-center text-sm">
              Apply filters to load the outgoing report.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OutgoingReportPage;
