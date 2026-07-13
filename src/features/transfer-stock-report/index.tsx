import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import type { Table as TanStackTable } from '@tanstack/react-table';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { useColdStorageStore } from '@/features/auth/store/use-cold-storage-store';
import { usePreferencesStore } from '@/features/auth/store/use-preferences-store';
import type { TransferStockReportRecord } from '@/features/transfer-stock-report/api/types';

import {
  useTransferStockReport,
  type TransferStockReportParams,
} from './api/use-transfer-stock-report';
import { getTransferStockReportColumns } from './components/columns';
import { DataTable } from './components/data-table';
import { ReportToolbar } from './components/report-toolbar';
import {
  TRANSFER_STOCK_REPORT_DOWNLOAD_EXCEL_DONE_MESSAGE,
  TRANSFER_STOCK_REPORT_DOWNLOAD_EXCEL_MESSAGE,
  openTransferStockReportPreview,
} from './utils/preview-transfer-stock-report-html';
import {
  countTransferStockReportSearchMatches,
  createTransferStockReportSearchIndex,
} from './utils/report-search';
import { buildTransferStockReportPdfData } from './utils/build-transfer-stock-report-pdf-data';

const DEFAULT_REPORT_PARAMS = {} satisfies TransferStockReportParams;

const TransferStockReportPage = () => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isReportTableReady, setIsReportTableReady] = useState(false);
  const [appliedParams, setAppliedParams] =
    useState<TransferStockReportParams>(DEFAULT_REPORT_PARAMS);
  const [isExporting, setIsExporting] = useState(false);
  const reportTableRef = useRef<TanStackTable<TransferStockReportRecord> | null>(null);
  const previewWindowRef = useRef<Window | null>(null);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const coldStorageName = useColdStorageStore((s) => s.coldStorage?.name);
  const showViewFilters = usePreferencesStore(
    (state) => state.preferences?.showViewFilters ?? false,
  );
  const { data, error, isFetching, isLoading, refetch } = useTransferStockReport(appliedParams);

  const reportRows = useMemo(
    () => data?.data.transferStockGatePasses ?? [],
    [data?.data.transferStockGatePasses],
  );
  const searchIndex = useMemo(() => createTransferStockReportSearchIndex(reportRows), [reportRows]);
  const visibleRowCount = useMemo(
    () => countTransferStockReportSearchMatches(searchIndex, deferredSearchQuery),
    [deferredSearchQuery, searchIndex],
  );
  const tableColumns = useMemo(() => getTransferStockReportColumns(reportRows), [reportRows]);

  const handleTableReady = useCallback((table: TanStackTable<TransferStockReportRecord>) => {
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
      { type: TRANSFER_STOCK_REPORT_DOWNLOAD_EXCEL_DONE_MESSAGE },
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
      const { exportTransferStockReportToExcel } =
        await import('./utils/export-transfer-stock-report-excel');
      await exportTransferStockReportToExcel({
        table: reportTable,
        coldStorageName: coldStorageName ?? 'Cold Storage',
        reportTitle: 'Transfer Stock Report',
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
  }, [coldStorageName, dateFrom, dateTo, notifyPreviewDownloadComplete]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== TRANSFER_STOCK_REPORT_DOWNLOAD_EXCEL_MESSAGE) return;

      void handleExportExcel();
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [handleExportExcel]);

  const handlePreview = useCallback(() => {
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
      previewWindowRef.current = openTransferStockReportPreview({
        table: reportTable,
        coldStorageName: coldStorageName ?? 'Cold Storage',
        reportTitle: 'Transfer Stock Report',
        dateFrom,
        dateTo,
      });
    } catch (previewError) {
      toast.error(
        previewError instanceof Error ? previewError.message : 'Failed to open report preview',
        { position: 'bottom-right' },
      );
    }
  }, [coldStorageName, dateFrom, dateTo]);

  const handleApply = useCallback(() => {
    const next: TransferStockReportParams = {};
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

  const getPdfData = useCallback(() => {
    const reportTable = reportTableRef.current;
    if (!reportTable) return null;

    if (reportTable.getFilteredRowModel().rows.length === 0) return null;

    return buildTransferStockReportPdfData({
      table: reportTable,
      reportTitle: 'Transfer Stock Report',
      dateFrom,
      dateTo,
    });
  }, [dateFrom, dateTo]);

  const reportTable = isReportTableReady ? reportTableRef.current : null;
  const isSearchPending = searchQuery !== deferredSearchQuery;

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <div className="border-border bg-card text-card-foreground overflow-hidden rounded-xl border shadow-sm">
        <div className="border-border/60 bg-muted/20 border-b px-4 py-4 sm:px-6">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
              <h1 className="font-heading text-foreground truncate text-xl font-semibold tracking-tight sm:text-2xl">
                Transfer stock report
              </h1>
              <p className="text-muted-foreground text-sm">
                {isLoading ? (
                  'Loading report...'
                ) : (
                  <>
                    <span className="text-foreground font-medium tabular-nums">
                      {visibleRowCount.toLocaleString('en-IN')}
                    </span>{' '}
                    {visibleRowCount === 1 ? 'transfer gate pass' : 'transfer gate passes'}
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
              Transfer stock gate passes
            </h2>
            <p className="text-muted-foreground text-sm">
              A simple table for the selected date range.
            </p>
          </div>

          <Badge variant="outline" className="w-fit gap-1.5">
            <span className="tabular-nums">{visibleRowCount}</span>
            rows
          </Badge>
        </div>

        <div className="relative">
          {isLoading ? (
            <div className="text-muted-foreground flex min-h-56 items-center justify-center gap-2 p-6 text-sm">
              <Loader2 className="size-4 animate-spin" />
              Loading transfer stock report...
            </div>
          ) : data ? (
            <div className="min-w-0">
              <DataTable
                columns={tableColumns}
                data={reportRows}
                quickSearch={searchQuery}
                onTableReady={handleTableReady}
              />
            </div>
          ) : (
            <div className="text-muted-foreground flex min-h-56 items-center justify-center p-6 text-center text-sm">
              Apply filters to load the transfer stock report.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransferStockReportPage;
